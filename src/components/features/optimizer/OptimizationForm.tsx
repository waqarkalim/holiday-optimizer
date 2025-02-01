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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsOptimizing(true)

    try {
      const days = parseInt(ctoDays, 10)
      if (isNaN(days) || days < 1 || days > 365) {
        setError('Please enter a valid number of days between 1 and 365')
        setIsOptimizing(false)
        return
      }

      const optimizedDays = optimizeCtoDays(days)
      onSuccess({ optimizedDays })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <label htmlFor="ctoDays" className="block text-sm font-medium text-gray-700">
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
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Enter number of days"
            min="1"
            max="365"
            required
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isOptimizing}
          className={clsx(
            'flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
            isOptimizing && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
        </button>
      </div>
    </form>
  )
} 