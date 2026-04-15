import type { RenderSettings } from '@features/settings/settingsTypes'

export interface RenderConfig {
  settings: RenderSettings
  tex: string
  displayMode: boolean
}

export const defaultRenderConfig: Omit<RenderConfig, 'tex' | 'settings'> = {
  displayMode: true,
}
