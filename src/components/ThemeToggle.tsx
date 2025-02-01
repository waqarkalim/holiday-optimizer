'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      type="button"
      className="fixed top-4 right-4 p-2 rounded-lg transition-all duration-200 ease-in-out"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <SunIcon 
          className={`absolute inset-0 h-5 w-5 rotate-0 transform text-gray-900 transition-all duration-200 dark:-rotate-90 dark:text-transparent ${theme === 'dark' ? 'scale-0' : 'scale-100'}`}
        />
        <MoonIcon 
          className={`absolute inset-0 h-5 w-5 rotate-90 transform text-transparent transition-all duration-200 dark:rotate-0 dark:text-gray-100 ${theme === 'dark' ? 'scale-100' : 'scale-0'}`}
        />
      </div>
    </button>
  )
} 