import { useRef } from 'react'
import './TexEditor.css'

interface Props {
  value: string
  onChange: (value: string) => void
  onRender: (tex: string) => void
}

export default function TexEditor({ value, onChange, onRender }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onRender(value)
    }
  }

  return (
    <div className="tex-editor">
      <div className="tex-editor-label">TeX Input</div>
      <textarea
        ref={textareaRef}
        className="tex-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter TeX expression…"
        spellCheck={false}
        autoComplete="off"
      />
      <div className="tex-editor-hint">Ctrl+Enter to render</div>
    </div>
  )
}
