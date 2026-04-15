import { parseSvgString, serializeSvg } from '@lib/svgUtils'
import type { TagSide } from '@features/settings/settingsTypes'

// MathJax 4 SVG structure for labeled equations (see SPEC.md):
//
//   <svg data-mjx-viewBox="0 -750 W 1000" width="Xex" height="Yex">
//     <g transform="scale(s,-s) …">
//       <g data-mml-node="mtable">
//         <g transform="… scale(S)">
//
//           <!-- equation body — centered via xMidYMid -->
//           <svg data-table="true"
//                preserveAspectRatio="xMidYMid"
//                viewBox="cx_eq−0.5  −750  1  1000">
//             <g> <g data-mml-node="mlabeledtr"> … </g> </g>
//           </svg>
//
//           <!-- tag "(N)" — right-aligned via xMaxYMid (left: xMinYMid) -->
//           <svg data-labels="true"
//                preserveAspectRatio="xMaxYMid"
//                viewBox="lx  −750  lw  1000">
//             <g data-mml-node="mtd" id="mjx-eqn:N"> … </g>
//           </svg>
//
//         </g>
//       </g>
//     </g>
//   </svg>
//
// Both nested SVGs have viewBox width = 1 and inherit the parent viewport.
// Because scale = min(W/1, 1000/1000) = 1 (meet), 1 unit in content space = 1
// unit in the outer SVG's viewBox space.
//
// Positioning (scale = 1):
//   equation (xMidYMid): tx = W/2 − cx_eq   → viewBox center → viewport center
//   tag right (xMaxYMid): tx = W − rx_lab   → viewBox right → viewport right
//   tag left  (xMinYMid): tx = −lx_lab      → viewBox left → viewport left
//
// Gap formula (right side):
//   gap = W/2 − rx_lab − eq_half_width
//   → W_new = 2 × (gap_units + rx_lab + eq_half_width)
//
// Gap formula (left side):
//   gap = W/2 − eq_half_width − label_display_width
//   → W_new = 2 × (gap_units + eq_half_width + label_display_width)
//
// NOTE: left-side xMinYMid behavior is derived from symmetry and has not been
// verified against real MathJax left-side SVG output. Mark with UNVERIFIED.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTranslateX(transform: string | null): number {
  if (!transform) return 0
  const m = transform.match(/translate\(\s*([-\d.eE+]+)/)
  return m ? parseFloat(m[1]) : 0
}

// Accumulate translate(x, …) recursively to find the rightmost absolute x in
// a subtree (coordinates relative to the element's parent, i.e. content space).
// Used to approximate eq_right_content and label_right_content without getBBox().
function maxAbsoluteX(el: Element, parentX: number): number {
  const x = parentX + parseTranslateX(el.getAttribute('transform'))
  let max = x
  for (const child of Array.from(el.children)) {
    max = Math.max(max, maxAbsoluteX(child, x))
  }
  return max
}

// Mirror of maxAbsoluteX — finds the leftmost absolute x in a subtree.
// Used to approximate the label's left edge for the right-side gap formula.
function minAbsoluteX(el: Element, parentX: number): number {
  const x = parentX + parseTranslateX(el.getAttribute('transform'))
  let min = x
  for (const child of Array.from(el.children)) {
    min = Math.min(min, minAbsoluteX(child, x))
  }
  return min
}

// Read the viewBox from 'viewBox' or fall back to 'data-mjx-viewBox'.
// MathJax 4 sets both, but at SVG capture time only data-mjx-viewBox may exist.
function parseViewBoxAttr(el: Element): [number, number, number, number] | null {
  const raw = el.getAttribute('viewBox') ?? el.getAttribute('data-mjx-viewBox') ?? ''
  const parts = raw.trim().split(/\s+/).map(parseFloat)
  if (parts.length < 4 || parts.some(isNaN)) return null
  return [parts[0], parts[1], parts[2], parts[3]]
}

// Convert a tagGap em string (e.g. '2em') to outer SVG units.
//
// The outer SVG 'height' attribute is in 'ex' (e.g. "2.262ex") and the viewBox
// height is always 1000 units, so:
//   units_per_ex = vbH / parseFloat(height_ex)
//   units_per_em = units_per_ex × 2   (standard TeX: 1em = 2ex)
//
// Fallback (height absent or unparseable): assume 1em = 884 units, a
// representative value for MathJax's default font metrics at 18px font size.
function emToOuterUnits(emStr: string, heightAttr: string, vbH: number): number {
  const em = parseFloat(emStr)
  if (isNaN(em) || em < 0) return 0
  const hm = heightAttr.match(/^([\d.]+)([a-z]+)$/)
  if (!hm || parseFloat(hm[1]) === 0) return em * 884
  const unitsPerSvgUnit = vbH / parseFloat(hm[1])
  // 1em = 2ex in TeX fonts; if height is in ex, scale up by 2
  const unitsPerEm = hm[2] === 'ex' ? unitsPerSvgUnit * 2 : unitsPerSvgUnit
  return em * unitsPerEm
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function repositionTags(
  svgString: string,
  tagGap: string,
  tagSide: TagSide,
): string {
  const svg = parseSvgString(svgString)

  // --- 1. Read outer SVG dimensions ---
  const outerVb = parseViewBoxAttr(svg)
  if (!outerVb) return svgString
  const [vbX, vbY, W, vbH] = outerVb
  const heightAttr = svg.getAttribute('height') ?? ''
  const widthAttr  = svg.getAttribute('width')  ?? ''

  // --- 2. Detect nested SVG structure ---
  const tableSvg = svg.querySelector('svg[data-table="true"]')
  const labelSvg = svg.querySelector('svg[data-labels="true"]')
  if (!tableSvg || !labelSvg) return svgString // no tags rendered → no-op

  // --- 3. Read nested SVG viewBoxes ---
  const tableVb = parseViewBoxAttr(tableSvg)
  const labelVb = parseViewBoxAttr(labelSvg)
  if (!tableVb || !labelVb) return svgString

  // cx_eq: center of the equation's viewBox (maps to viewport center via xMidYMid)
  const cx_eq  = tableVb[0] + tableVb[2] / 2
  // rx_lab: right edge of label's viewBox (maps to viewport right via xMaxYMid)
  const rx_lab = labelVb[0] + labelVb[2]
  // lx_lab: left edge of label's viewBox (maps to viewport left via xMinYMid)
  const lx_lab = labelVb[0]

  // --- 4. Compute eq_half_width ---
  // maxAbsoluteX on the entire data-table content covers all rows (multi-row
  // align environments have all mlabeledtr children inside one data-table SVG).
  const tableRoot = tableSvg.querySelector('g')
  if (!tableRoot) return svgString
  const eq_right_content = maxAbsoluteX(tableRoot, 0)
  const eq_half_width = eq_right_content - cx_eq
  if (eq_half_width <= 0) return svgString // degenerate content — bail out

  // --- 5. Compute label content bounds ---
  const labelRoot = labelSvg.querySelector('g')
  // Right side (xMaxYMid): gap = label_left_viewport − eq_right_viewport
  //   label_left_viewport = label_left_content − rx_lab + W
  //   → W_new = 2×(gap + rx_lab − label_left_content + eq_half_width)
  // Left side (xMinYMid): gap = eq_left_viewport − label_right_viewport
  //   label_right_viewport = label_right_content − lx_lab
  //   → W_new = 2×(gap + eq_half_width + label_right_content − lx_lab)
  const label_left_content  = labelRoot ? minAbsoluteX(labelRoot, 0) : rx_lab
  const label_right_content = labelRoot ? maxAbsoluteX(labelRoot, 0) : lx_lab

  // --- 6. Convert tagGap to outer SVG units ---
  const gap_units = emToOuterUnits(tagGap, heightAttr, vbH)

  // --- 7. Compute W_new ---
  let W_new: number
  if (tagSide === 'right') {
    // space from label left edge to viewBox right edge (rx_lab), in content coordinates
    const label_right_margin = rx_lab - label_left_content
    W_new = 2 * (gap_units + label_right_margin + eq_half_width)
  } else {
    // UNVERIFIED: left-side xMinYMid structure derived from symmetry.
    const label_display_width = label_right_content - lx_lab
    W_new = 2 * (gap_units + eq_half_width + label_display_width)
  }
  // Safety clamp: never go narrower than the equation content itself
  W_new = Math.max(W_new, eq_half_width * 2)

  // --- 8. Write updated attributes ---
  const vbStr = `${vbX} ${vbY} ${W_new} ${vbH}`
  svg.setAttribute('viewBox', vbStr)
  svg.setAttribute('data-mjx-viewBox', vbStr)

  // Scale width proportionally. Skip if the attribute is a percentage (e.g. "100%")
  // since '%' is not matched by [a-z] in the regex.
  const wm = widthAttr.match(/^([\d.]+)([a-z]+)$/)
  if (wm && parseFloat(wm[1]) > 0) {
    const newW = parseFloat(wm[1]) * W_new / W
    svg.setAttribute('width', `${newW.toFixed(3)}${wm[2]}`)
  }

  return serializeSvg(svg)
}
