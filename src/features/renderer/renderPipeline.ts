import type { RenderConfig } from './renderOptions'
import { renderTex } from './renderTex'
import { normalizeTex, sanitizeTex } from '@lib/stringUtils'
import { wrapInDisplayMath } from '@features/equations/alignParser'
import { applyDimensions } from '@features/sizing/svgDimensions'

export async function runRenderPipeline(config: RenderConfig): Promise<string> {
  const { tex: rawTex, settings, displayMode } = config

  // 1. Sanitize & normalize
  let tex = sanitizeTex(normalizeTex(rawTex))

  // 2. Wrap in display environment if needed
  if (displayMode) {
    tex = wrapInDisplayMath(tex, settings.wrapEnvironment)
  }

  // 3. Render via MathJax → raw SVG string
  let svgString = await renderTex(tex, displayMode, {
    tagSide: settings.tagSide,
  })

  // 4. Apply user dimensions
  svgString = applyDimensions(svgString, settings)

  return svgString
}
