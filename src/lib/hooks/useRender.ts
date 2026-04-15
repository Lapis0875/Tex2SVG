import { useCallback, useRef, useState } from 'react'
import type { RenderSettings } from '@features/settings/settingsTypes'
import { runRenderPipeline } from '@features/renderer/renderPipeline'
import { defaultRenderConfig } from '@features/renderer/renderOptions'

interface RenderState {
  svgOutput: string | null
  isRendering: boolean
  error: string | null
}

export function useRender(settings: RenderSettings) {
  const [state, setState] = useState<RenderState>({
    svgOutput: null,
    isRendering: false,
    error: null,
  })
  const texRef = useRef<string>('')

  const render = useCallback(
    async (tex: string) => {
      texRef.current = tex
      setState((s) => ({ ...s, isRendering: true, error: null }))
      try {
        const svg = await runRenderPipeline({
          ...defaultRenderConfig,
          tex,
          settings,
        })
        // Only update if this is still the latest render
        if (texRef.current === tex) {
          setState({ svgOutput: svg, isRendering: false, error: null })
        }
      } catch (err) {
        if (texRef.current === tex) {
          const message = err instanceof Error ? err.message : 'Unknown render error'
          setState({ svgOutput: null, isRendering: false, error: message })
        }
      }
    },
    [settings],
  )

  return { ...state, render }
}
