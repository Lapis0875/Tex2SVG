export type NumberingStyle = 'arabic' | 'roman'

export interface EquationBlock {
  id: string
  tex: string
  tag: string
}

export type AlignEnv = 'align' | 'align*' | 'equation' | 'equation*' | 'gather' | 'gather*' | 'multline'
