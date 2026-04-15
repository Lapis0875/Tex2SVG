import { useState } from 'react'
import './SupportedEnvList.css'

const SUPPORTED = [
  'Inkscape — SVG import',
  'Hancom (한글) — SVG import',
]

export default function SupportedEnvList() {
  const [open, setOpen] = useState(true)

  return (
    <div className="supported-env">
      <button className="supported-env-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="supported-env-label">Supported editors</span>
        <span className="supported-env-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <ul className="supported-env-list">
          {SUPPORTED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
