import { parseSvgString, serializeSvg } from '@lib/svgUtils'
import { exToPx } from '@features/sizing/viewBoxUtils'

// Attribute name prefixes that are not part of SVG and break strict parsers
// (Hancom Office, Inkscape batch, LaTeX \includegraphics, etc.)
const NON_SVG_PREFIXES = ['data-', 'aria-']
// Specific HTML-origin attributes on the root SVG element
const NON_SVG_ATTRS = new Set(['role', 'focusable'])

// Default font size for ex→px conversion when no settings are available.
// Matches settingsDefaults.ts render.fontSize.
const DEFAULT_FONT_SIZE = 18

// MathJax puts HTML/CSS hints on the root <svg> that break strict SVG parsers:
//   style="vertical-align: ...; min-width: Xex;"  (used for inline layout only)
//   width="100%"  (MathJax display equations always use 100%)
// This function converts those to absolute px dimensions and removes the style.
function resolveRootDimensions(svg: Element): void {
  const style = svg.getAttribute('style') ?? ''
  const widthAttr = svg.getAttribute('width') ?? ''
  const heightAttr = svg.getAttribute('height') ?? ''

  // Convert height from ex to px
  const heightExMatch = heightAttr.match(/^([\d.]+)ex$/)
  if (heightExMatch) {
    const hPx = exToPx(parseFloat(heightExMatch[1]), DEFAULT_FONT_SIZE)
    svg.setAttribute('height', `${Math.ceil(hPx)}px`)
  }

  // Convert width: "100%" → use min-width from style; "Xex" → direct conversion
  if (widthAttr === '100%') {
    const minWidthMatch = style.match(/min-width:\s*([\d.]+)ex/)
    if (minWidthMatch) {
      const wPx = exToPx(parseFloat(minWidthMatch[1]), DEFAULT_FONT_SIZE)
      svg.setAttribute('width', `${Math.ceil(wPx)}px`)
    }
  } else if (widthAttr.endsWith('ex')) {
    const wEx = parseFloat(widthAttr)
    if (!isNaN(wEx)) {
      svg.setAttribute('width', `${Math.ceil(exToPx(wEx, DEFAULT_FONT_SIZE))}px`)
    }
  }

  // Remove the style attribute — vertical-align and min-width are HTML-only
  svg.removeAttribute('style')
}

// XLink namespace (xlink:href) is deprecated in SVG 2.0 and rejected by strict
// parsers (Hancom, some PDF renderers). Migrate all xlink:href → href and drop
// the xmlns:xlink namespace declaration from the root element.
const XLINK_NS = 'http://www.w3.org/1999/xlink'

function migrateXlinkHrefs(root: Element): void {
  function traverse(el: Element): void {
    const val = el.getAttributeNS(XLINK_NS, 'href')
    if (val !== null) {
      el.setAttribute('href', val)
      el.removeAttributeNS(XLINK_NS, 'href')
    }
    for (const child of Array.from(el.children)) traverse(child)
  }
  traverse(root)
  // Remove the namespace declaration so serializers don't re-emit xmlns:xlink
  root.removeAttribute('xmlns:xlink')
}

// MathJax nested <svg> elements have viewBox width = 1 and rely on overflow
// being visible to show content outside that 1-unit slice.
// Browsers allow this permissively; strict renderers (Hancom) clip it → blank box.
// Setting overflow="visible" on nested SVGs makes the behavior explicit.
function allowNestedSvgOverflow(root: Element): void {
  for (const nested of Array.from(root.querySelectorAll('svg'))) {
    nested.setAttribute('overflow', 'visible')
  }
}

// Replace every <use href="#id"> with an inline copy of the referenced element.
// This eliminates cross-SVG-boundary reference issues: MathJax puts <defs> in
// the root SVG but <use> elements inside nested <svg> elements — strict renderers
// (Hancom, some PDF tools) cannot resolve those cross-boundary href lookups.
// After inlining, <defs> are removed since nothing references them.
function flattenUseDefs(root: Element): void {
  const defsMap = new Map<string, Element>()
  for (const defs of Array.from(root.querySelectorAll('defs'))) {
    for (const child of Array.from(defs.children)) {
      const id = child.getAttribute('id')
      if (id) defsMap.set(id, child)
    }
  }

  for (const useEl of Array.from(root.querySelectorAll('use'))) {
    const href = useEl.getAttribute('href') ?? ''
    if (!href.startsWith('#')) continue
    const ref = defsMap.get(href.slice(1))
    if (!ref) continue

    const clone = ref.cloneNode(true) as Element
    clone.removeAttribute('id')

    // Carry over x/y or transform from <use> if present
    const x = useEl.getAttribute('x')
    const y = useEl.getAttribute('y')
    const t = useEl.getAttribute('transform')
    if (x !== null || y !== null) {
      const existing = clone.getAttribute('transform') ?? ''
      clone.setAttribute('transform', `translate(${x ?? 0},${y ?? 0})${existing ? ' ' + existing : ''}`)
    } else if (t !== null) {
      const existing = clone.getAttribute('transform') ?? ''
      clone.setAttribute('transform', existing ? `${t} ${existing}` : t)
    }

    useEl.parentNode?.replaceChild(clone, useEl)
  }

  for (const defs of Array.from(root.querySelectorAll('defs'))) {
    defs.remove()
  }
}

function stripNonSvgAttributes(el: Element): void {
  const toRemove: string[] = []
  for (const { name } of Array.from(el.attributes)) {
    if (NON_SVG_PREFIXES.some(p => name.startsWith(p)) || NON_SVG_ATTRS.has(name)) {
      toRemove.push(name)
    }
  }
  for (const name of toRemove) el.removeAttribute(name)
  for (const child of Array.from(el.children)) stripNonSvgAttributes(child)
}

// Produce a clean, standards-compliant SVG string suitable for external editors.
// - Removes all data-* and aria-* attributes (MathJax semantic/accessibility data)
// - Removes role, focusable (HTML attributes on the root SVG)
// - Removes <title> elements added by MathJax for screen readers
// NOTE: MJX-* IDs on <path>/<defs> elements are kept — they are referenced by
// <use xlink:href="#MJX-*"> glyph references and must remain intact.
export function cleanSvg(svgString: string): string {
  const svg = parseSvgString(svgString)

  // Resolve root SVG dimensions to absolute px and remove HTML-only style
  resolveRootDimensions(svg)

  // Migrate deprecated xlink:href → href and drop xmlns:xlink namespace
  migrateXlinkHrefs(svg)

  // Allow nested SVG overflow so MathJax's viewBox-width-1 layout renders correctly
  allowNestedSvgOverflow(svg)

  // Inline all <use href="#id"> with direct path copies; remove <defs>
  flattenUseDefs(svg)

  // Remove MathJax screen-reader title elements
  for (const title of Array.from(svg.querySelectorAll('title'))) {
    title.remove()
  }

  // Strip all non-SVG attributes from every element in the tree
  stripNonSvgAttributes(svg)

  return serializeSvg(svg)
}
