import type { NumberingStyle } from './equationTypes'

function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  let result = ''
  let num = n
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i]
      num -= vals[i]
    }
  }
  return result
}

function formatTag(n: number, style: NumberingStyle): string {
  return style === 'roman' ? toRoman(n) : String(n)
}

export function injectEquationNumbers(tex: string, style: NumberingStyle): string {
  let counter = 1
  // Replace unnumbered equation environments with numbered + \tag{}
  return tex.replace(/\\begin\{(equation|align|gather)\*\}/g, (_, env: string) => {
    const tag = formatTag(counter++, style)
    return `\\begin{${env}}\\tag{${tag}}`
  }).replace(/\\end\{(equation|align|gather)\*\}/g, (_, env: string) => `\\end{${env}}`)
}
