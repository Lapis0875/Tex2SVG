import { useEffect, useState } from 'react'
import './LogPanel.css'

interface LogEntry {
  id: number
  timestamp: string
  message: string
}

interface Props {
  error: string | null
}

let nextId = 0

function timestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LogPanel({ error }: Props) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (error) {
      setLogs((prev) => [...prev, { id: nextId++, timestamp: timestamp(), message: error }])
      setOpen(true)
    }
  }, [error])

  // Auto-close when error clears and there are no accumulated logs
  useEffect(() => {
    if (!error && logs.length === 0) setOpen(false)
  }, [error, logs.length])

  return (
    <div className={`log-panel${open ? ' log-panel--open' : ''}${logs.length > 0 ? ' log-panel--has-errors' : ''}`}>
      <button className="log-panel-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="log-panel-title">
          {logs.length > 0 && <span className="log-panel-badge">{logs.length}</span>}
          Logs
        </span>
        <span className="log-panel-chevron">{open ? '▲' : '▼'}</span>
        {logs.length > 0 && (
          <button
            className="log-panel-clear"
            onClick={(e) => {
              e.stopPropagation()
              setLogs([])
              setOpen(false)
            }}
          >
            Clear
          </button>
        )}
      </button>
      {open && (
        <div className="log-panel-body">
          {logs.length === 0 ? (
            <div className="log-panel-empty">No errors.</div>
          ) : (
            <ul className="log-panel-list">
              {logs.map((entry) => (
                <li key={entry.id} className="log-entry">
                  <span className="log-entry-time">{entry.timestamp}</span>
                  <span className="log-entry-msg">{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
