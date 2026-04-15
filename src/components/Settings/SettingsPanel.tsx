import { useState } from 'react'
import { useSettings } from '@lib/hooks/useSettings'
import DimensionInput from './DimensionInput'
import type { DimensionMode, TagSide, Theme, WrapEnvironment } from '@features/settings/settingsTypes'
import { getInitializedTagConfig } from '@features/renderer/mathjaxLoader'
import './SettingsPanel.css'

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { settings, updateRender, updateExport, updateTheme } = useSettings()
  const { render: rs, export: es } = settings

  return (
    <div className="settings-panel">
      <button className="settings-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▲ Settings' : '▼ Settings'}
      </button>
      {open && (
        <div className="settings-body">
          <label className="settings-row">
            <span>Size mode</span>
            <select
              value={rs.dimensionMode}
              onChange={(e) => updateRender({ dimensionMode: e.target.value as DimensionMode })}
            >
              <option value="auto">Auto</option>
              <option value="fixed">Fixed (px)</option>
              <option value="resolution">Resolution (DPI)</option>
            </select>
          </label>

          {rs.dimensionMode === 'fixed' && (
            <>
              <DimensionInput label="Width" value={rs.size.width} onChange={(w) => updateRender({ size: { ...rs.size, width: w } })} />
              <DimensionInput label="Height" value={rs.size.height} onChange={(h) => updateRender({ size: { ...rs.size, height: h } })} />
            </>
          )}

          {rs.dimensionMode === 'resolution' && (
            <DimensionInput label="DPI" value={rs.resolution.dpi} unit="dpi" onChange={(dpi) => updateRender({ resolution: { dpi } })} />
          )}

          <DimensionInput label="Font size" value={rs.fontSize} unit="px" onChange={(fontSize) => updateRender({ fontSize })} />

          <label className="settings-row">
            <span>Wrap as</span>
            <select
              value={rs.wrapEnvironment}
              onChange={(e) => updateRender({ wrapEnvironment: e.target.value as WrapEnvironment })}
            >
              <option value="equation*">equation*</option>
              <option value="align*">align*</option>
              <option value="none">None (no wrap)</option>
            </select>
          </label>

          <label className="settings-row">
            <span>Tag side</span>
            <select
              value={rs.tagSide}
              onChange={(e) => updateRender({ tagSide: e.target.value as TagSide })}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </label>

          {(() => {
            const init = getInitializedTagConfig()
            const needsReload = init && init.tagSide !== rs.tagSide
            return needsReload ? (
              <div className="settings-reload-warning">
                Tag side change requires a page reload.
                <button className="settings-reload-btn" onClick={() => window.location.reload()}>
                  Reload now
                </button>
              </div>
            ) : null
          })()}

          <label className="settings-row">
            <span>Theme</span>
            <select
              value={settings.theme}
              onChange={(e) => updateTheme(e.target.value as Theme)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label className="settings-row">
            <span>Export filename</span>
            <input
              type="text"
              value={es.filename}
              onChange={(e) => updateExport({ filename: e.target.value })}
            />
          </label>


        </div>
      )}
    </div>
  )
}
