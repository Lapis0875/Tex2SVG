import { useState } from 'react'
import './TexTips.css'

const TIPS = [
  {
    title: 'Tag spacing — add space before tag',
    code: '\\begin{equation}\n  E = mc^2 \\qquad\n\\end{equation}',
  },
  {
    title: 'Tag spacing — precise control',
    code: '\\begin{equation}\n  E = mc^2 \\hspace{2em}\n\\end{equation}',
  },
  {
    title: 'Tag spacing — reduce gap',
    code: '\\begin{equation}\n  E = mc^2 \\hspace{0.5em}\n\\end{equation}',
  },
  {
    title: 'Align environment',
    code: '\\begin{align}\n  a &= b + c \\\\\n  d &= e + f\n\\end{align}',
  },
  {
    title: 'Split inside equation',
    code: '\\begin{equation}\n  \\begin{split}\n    a &= b + c \\\\\n      &= d + e\n  \\end{split}\n\\end{equation}',
  },
  {
    title: 'Manual tag',
    code: '\\begin{equation}\n  F = ma \\tag{2a}\n\\end{equation}',
  },
  {
    title: 'No tag (starred)',
    code: '\\begin{equation*}\n  \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}\n\\end{equation*}',
  },
]

interface Props {
  onInsert: (code: string) => void
}

export default function TexTips({ onInsert }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="tex-tips">
      <button className="tex-tips-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '▲ TeX Tips' : '▼ TeX Tips'}
      </button>
      {open && (
        <ul className="tex-tips-list">
          {TIPS.map((tip) => (
            <li key={tip.title} className="tex-tip">
              <span className="tex-tip-title">{tip.title}</span>
              <pre className="tex-tip-code">{tip.code}</pre>
              <button className="tex-tip-insert" onClick={() => onInsert(tip.code)}>
                Insert
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
