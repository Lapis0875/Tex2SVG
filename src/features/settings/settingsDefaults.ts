import type { AppSettings } from './settingsTypes'

export const defaultSettings: AppSettings = {
  theme: 'system',
  render: {
    dimensionMode: 'auto',
    size: { width: 800, height: 200 },
    resolution: { dpi: 96 },
    fontSize: 18,
    tagSide: 'right',
    wrapEnvironment: 'equation*',
  },
  export: {
    filename: 'equation',
  },
}
