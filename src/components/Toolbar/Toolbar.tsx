import { useSettings } from '@lib/hooks/useSettings'
import { useClipboard } from '@lib/hooks/useClipboard'
import { downloadSvg } from '@features/export/svgExporter'
import './Toolbar.css'

interface Props {
  svgOutput: string | null
  isRendering: boolean
  onRender: (tex: string) => void
}

export default function Toolbar({ svgOutput, isRendering }: Props) {
  const { settings } = useSettings()
  const { copy, copied } = useClipboard()

  async function handleCopy() {
    if (svgOutput) await copy(svgOutput)
  }

  function handleDownload() {
    if (svgOutput) downloadSvg(svgOutput, settings.export.filename)
  }

  return (
    <div className="toolbar">
      <button className="toolbar-btn" onClick={handleCopy} disabled={!svgOutput || isRendering}>
        {copied ? 'Copied!' : 'Copy SVG'}
      </button>
      <button className="toolbar-btn" onClick={handleDownload} disabled={!svgOutput || isRendering}>
        Download .svg
      </button>
    </div>
  )
}
