export type DimensionMode = 'auto' | 'fixed' | 'resolution'

export interface SvgSize {
  width: number
  height: number
}

export interface Resolution {
  dpi: number
}

export type TagSide = 'right' | 'left'

export type WrapEnvironment = 'equation*' | 'align*' | 'none'

export interface RenderSettings {
  dimensionMode: DimensionMode
  size: SvgSize
  resolution: Resolution
  fontSize: number
  tagSide: TagSide
  wrapEnvironment: WrapEnvironment
}

export interface ExportSettings {
  filename: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppSettings {
  render: RenderSettings
  export: ExportSettings
  theme: Theme
}
