import './SvgPreview.css'

interface Props {
  svgOutput: string | null
  isRendering: boolean
}

export default function SvgPreview({ svgOutput, isRendering }: Props) {
  if (isRendering) {
    return <div className="svg-preview svg-preview--loading">Rendering…</div>
  }

  if (!svgOutput) {
    return <div className="svg-preview svg-preview--empty">Enter TeX and press Ctrl+Enter to render.</div>
  }

  return (
    <div
      className="svg-preview"
      // SVG is generated locally via MathJax — not user-supplied HTML
      dangerouslySetInnerHTML={{ __html: svgOutput }}
    />
  )
}
