import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, RenderSettings, ExportSettings, Theme } from './settingsTypes'
import { defaultSettings } from './settingsDefaults'

interface SettingsStore {
  settings: AppSettings
  updateRender: (patch: Partial<RenderSettings>) => void
  updateExport: (patch: Partial<ExportSettings>) => void
  updateTheme: (theme: Theme) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateRender: (patch) =>
        set((s) => ({ settings: { ...s.settings, render: { ...s.settings.render, ...patch } } })),
      updateExport: (patch) =>
        set((s) => ({ settings: { ...s.settings, export: { ...s.settings.export, ...patch } } })),
      updateTheme: (theme) =>
        set((s) => ({ settings: { ...s.settings, theme } })),
      reset: () => set({ settings: defaultSettings }),
    }),
    { name: 'tex2svg-settings' },
  ),
)
