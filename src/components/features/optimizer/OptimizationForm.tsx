'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { optimizeCtoDays } from '@/services/optimizer'

interface OptimizationFormProps {
  onSuccess: (data: any) => void
}

export function OptimizationForm({ onSuccess }: OptimizationFormProps) {
  const [ctoDays, setCtoDays] = useState('')
  const [error, setError] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsOptimizing(true)

    try {
      const days = parseInt(ctoDays, 10)
      if (isNaN(days) || days < 1 || days > 365) {
        setError('Please enter a valid number between 1 and 365')
        setIsOptimizing(false)
        return
      }

      const optimizedDays = optimizeCtoDays(days)
      await onSuccess({ optimizedDays })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
      <div>
        <label htmlFor="ctoDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Number of CTO Days
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="ctoDays"
            id="ctoDays"
            value={ctoDays}
            onChange={(e) => setCtoDays(e.target.value)}
            className={clsx(
              'block w-full rounded-md shadow-sm sm:text-sm transition-colors',
              'border-gray-300 dark:border-gray-600/40',
              'bg-white dark:bg-gray-800/50',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
              error && 'border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
            )}
            placeholder="Enter number of days"
            min="1"
            max="365"
            required
            disabled={isOptimizing}
            aria-invalid={!!error}
            aria-describedby={error ? 'cto-days-error' : undefined}
          />
        </div>
        {error && (
          <p id="cto-days-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isOptimizing}
          aria-disabled={isOptimizing}
          data-testid="submit-button"
          className={clsx(
            'flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors',
            'bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-400',
            'text-white dark:text-gray-50',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400',
            isOptimizing && 'opacity-50 cursor-not-allowed bg-blue-400 dark:bg-blue-400'
          )}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
        </button>
      </div>
    </form>
  )
} 