import { useState } from 'react'

export function useLocalStorage(key: string, initialValue: string): [string, (value: string) => void] {
  const [stored, setStored] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(value: string) {
    setStored(value)
    try {
      localStorage.setItem(key, value)
    } catch {
      // storage quota exceeded or private browsing — degrade silently
    }
  }

  return [stored, setValue]
}
