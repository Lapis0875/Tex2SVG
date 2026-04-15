// MathJax SVG uses ex units. 1ex ≈ fontSize * 0.5 px (approximation).
export function exToPx(exValue: number, fontSizePx: number): number {
  return exValue * fontSizePx * 0.5
}

export function buildViewBox(x: number, y: number, width: number, height: number): string {
  return `${x} ${y} ${width} ${height}`
}

// Parse a value like "12.5ex" or "200px" into a number and unit
export function parseDimension(value: string): { amount: number; unit: string } {
  const match = value.match(/^([\d.]+)([a-z%]+)$/)
  if (!match) throw new Error(`Cannot parse dimension: ${value}`)
  return { amount: parseFloat(match[1]), unit: match[2] }
}
