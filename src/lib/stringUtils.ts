export function normalizeTex(tex: string): string {
  return tex.trim().replace(/\r\n/g, '\n')
}

export function sanitizeTex(tex: string): string {
  // Remove null bytes and other control characters that could break MathJax
  return tex.replace(/\x00/g, '').replace(/[\x01-\x08\x0b\x0c\x0e-\x1f]/g, '')
}
