export function parseSvgString(svgString: string): SVGSVGElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, 'image/svg+xml')
  const svgEl = doc.documentElement
  if (svgEl.tagName === 'parsererror') {
    throw new Error('Invalid SVG string')
  }
  return svgEl as unknown as SVGSVGElement
}

export function getSvgDimensions(svgString: string): { width: string; height: string } {
  const svg = parseSvgString(svgString)
  return {
    width: svg.getAttribute('width') ?? '',
    height: svg.getAttribute('height') ?? '',
  }
}

export function serializeSvg(svg: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svg)
}
