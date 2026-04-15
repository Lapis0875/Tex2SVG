// MathJax is loaded via CDN to avoid bundling its large codebase.
declare global {
  interface Window {
    MathJax: {
      tex2svgPromise: (tex: string, options?: Record<string, unknown>) => Promise<Element>
      startup: { promise: Promise<void> }
    }
  }
}

export interface MathJaxTagConfig {
  tagSide: 'right' | 'left'
}

// The tag config that MathJax was actually initialized with this session.
// tagSide is an init-time setting — it cannot be changed without a full page
// reload, because MathJax 4 caches its TeX input jax at the module level.
let initializedTagConfig: MathJaxTagConfig | null = null
let initPromise: Promise<void> | null = null

export function getInitializedTagConfig(): MathJaxTagConfig | null {
  return initializedTagConfig
}

export async function loadMathJax(tagConfig: MathJaxTagConfig): Promise<void> {
  if (initPromise) return initPromise

  initializedTagConfig = tagConfig

  initPromise = new Promise((resolve, reject) => {
    // Configure MathJax before the script loads. The pre-config object has a
    // different shape than the running MathJax instance, so cast via unknown.
    // texhtml is explicitly excluded to guarantee pure SVG output (no <foreignObject>).
    ;(window as unknown as Record<string, unknown>)['MathJax'] = {
      tex: {
        packages: { '[+]': ['ams'], '[-]': ['texhtml'] },
        tags: 'none',
        tagSide: tagConfig.tagSide,
      },
      svg: {
        fontCache: 'local',
      },
      startup: {
        typeset: false,
      },
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@4/tex-svg.js'
    script.async = true
    script.onload = () => {
      window.MathJax.startup.promise.then(() => resolve()).catch(reject)
    }
    script.onerror = () => reject(new Error('Failed to load MathJax'))
    document.head.appendChild(script)
  })

  return initPromise
}
