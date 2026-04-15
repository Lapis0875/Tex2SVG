import { cleanSvg } from './svgCleaner'

export function downloadSvg(svgString: string, filename: string): void {
  const content = cleanSvg(svgString)
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
