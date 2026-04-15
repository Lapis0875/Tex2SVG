import { useSettingsStore } from '@features/settings/settingsStore'

export function useSettings() {
  const { settings, updateRender, updateExport, updateTheme, reset } = useSettingsStore()
  return { settings, updateRender, updateExport, updateTheme, reset }
}
