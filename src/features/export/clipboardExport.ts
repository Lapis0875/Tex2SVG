import { cleanSvg } from './svgCleaner'

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(cleanSvg(text))
}
