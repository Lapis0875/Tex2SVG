import './SettingsPanel.css'

interface Props {
  label: string
  value: number
  unit?: string
  min?: number
  onChange: (value: number) => void
}

export default function DimensionInput({ label, value, unit = 'px', min = 1, onChange }: Props) {
  return (
    <label className="dimension-input">
      <span className="dimension-input-label">{label}</span>
      <div className="dimension-input-row">
        <input
          type="number"
          value={value}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="dimension-input-unit">{unit}</span>
      </div>
    </label>
  )
}
