import { useState } from 'react'
import { copyToClipboard } from '@features/export/clipboardExport'

export function useClipboard() {
  const [copied, setCopied] = useState(false)

  async function copy(text: string) {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { copy, copied }
}
