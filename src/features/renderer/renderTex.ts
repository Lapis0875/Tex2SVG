import { loadMathJax, type MathJaxTagConfig } from './mathjaxLoader'
import { RenderError } from '@lib/errorUtils'

export async function renderTex(
  tex: string,
  displayMode: boolean,
  tagConfig: MathJaxTagConfig,
): Promise<string> {
  await loadMathJax(tagConfig)

  try {
    const node = await window.MathJax.tex2svgPromise(tex, { display: displayMode })
    // MathJax 4 returns the <svg> element directly; v3 wrapped it in a container.
    const svgEl: Element =
      node.tagName?.toLowerCase() === 'svg' ? node : (node.querySelector('svg') ?? node)
    if (!svgEl) throw new RenderError('MathJax produced no SVG output')
    return svgEl.outerHTML
  } catch (err) {
    if (err instanceof RenderError) throw err
    throw new RenderError('MathJax rendering failed', err)
  }
}
