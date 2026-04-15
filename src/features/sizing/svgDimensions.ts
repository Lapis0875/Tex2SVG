import type { RenderSettings } from '@features/settings/settingsTypes'
import { parseSvgString, serializeSvg } from '@lib/svgUtils'
import { parseDimension, exToPx } from './viewBoxUtils'

export function applyDimensions(svgString: string, settings: RenderSettings): string {
  if (settings.dimensionMode === 'auto') return svgString

  const svg = parseSvgString(svgString)

  let targetW: number
  let targetH: number

  if (settings.dimensionMode === 'fixed') {
    targetW = settings.size.width
    targetH = settings.size.height
  } else {
    // resolution mode: scale native pixel dimensions by DPI factor.
    // Use height attr (always in ex from MathJax) as the canonical native height.
    // Derive native width from the viewBox aspect ratio — correct for both
    // "Xex" and "100%" SVGs (MathJax 4 uses "100%" for display equations).
    const rawHeight = svg.getAttribute('height') ?? '0ex'
    const { amount: hAmount, unit: hUnit } = parseDimension(rawHeight)
    const nativeH = hUnit === 'ex' ? exToPx(hAmount, settings.fontSize) : hAmount

    const vbRaw = svg.getAttribute('viewBox') ?? svg.getAttribute('data-mjx-viewBox') ?? ''
    const vbParts = vbRaw.trim().split(/\s+/).map(Number)
    const vbW = vbParts[2]
    const vbH = vbParts[3]
    const nativeW = vbW > 0 && vbH > 0 ? nativeH * (vbW / vbH) : nativeH

    const scale = settings.resolution.dpi / 96
    targetW = nativeW * scale
    targetH = nativeH * scale
  }

  svg.setAttribute('width', `${targetW}px`)
  svg.setAttribute('height', `${targetH}px`)
  // Do NOT reset the viewBox. The MathJax viewBox (set by repositionTags or
  // MathJax directly) correctly maps content coordinates to the viewport.
  // Changing only width/height causes the SVG renderer to scale content
  // proportionally via preserveAspectRatio="xMidYMid meet" (default).

  return serializeSvg(svg)
}
