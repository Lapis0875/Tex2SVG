import { useEffect } from 'react'
import TexEditor from '@components/Editor/TexEditor'
import SvgPreview from '@components/Preview/SvgPreview'
import Toolbar from '@components/Toolbar/Toolbar'
import SettingsPanel from '@components/Settings/SettingsPanel'
import LogPanel from '@components/LogPanel/LogPanel'
import SupportedEnvList from '@components/SupportedEnvList/SupportedEnvList'
import TexTips from '@components/TexTips/TexTips'
import { useRender } from '@lib/hooks/useRender'
import { useSettings } from '@lib/hooks/useSettings'
import { useLocalStorage } from '@lib/hooks/useLocalStorage'

export default function App() {
  const { settings } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', settings.theme)
    }
  }, [settings.theme])
  const [tex, setTex] = useLocalStorage('tex2svg-input', '')
  const { svgOutput, isRendering, error, render } = useRender(settings.render)

  return (
    <div className="app-layout">
      <header className="app-header">
        <img src="/favicon.png" alt="Tex2SVG logo" className="app-header-logo" />
        <h1>Tex2SVG</h1>
        <Toolbar svgOutput={svgOutput} onRender={render} isRendering={isRendering} />
      </header>
      <main className="app-main">
        <aside className="app-sidebar">
          <TexEditor value={tex} onChange={setTex} onRender={render} />
          <TexTips onInsert={setTex} />
          <SettingsPanel />
        </aside>
        <section className="app-preview">
          <SvgPreview svgOutput={svgOutput} isRendering={isRendering} />
          <SupportedEnvList />
          <LogPanel error={error} />
        </section>
      </main>
    </div>
  )
}
