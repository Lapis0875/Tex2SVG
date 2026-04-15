import type { AlignEnv } from './equationTypes'

const ALIGN_ENVS: AlignEnv[] = ['align', 'align*', 'equation', 'equation*', 'gather', 'gather*', 'multline']

export function detectEnvironment(tex: string): AlignEnv | null {
  for (const env of ALIGN_ENVS) {
    if (tex.includes(`\\begin{${env}}`)) return env
  }
  return null
}

export function wrapInDisplayMath(tex: string, wrapEnv: 'equation*' | 'align*' | 'none' = 'equation*'): string {
  if (wrapEnv === 'none') return tex
  const env = detectEnvironment(tex)
  if (env) return tex
  return `\\begin{${wrapEnv}}\n${tex}\n\\end{${wrapEnv}}`
}
