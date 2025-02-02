import { useState } from 'react'
import clsx from 'clsx'
import type { OptimizationStrategy } from '@/services/optimizer'
import { OPTIMIZATION_STRATEGIES } from '@/services/optimizer'

interface OptimizationFormProps {
  onOptimize: (numberOfDays: number, strategy: OptimizationStrategy) => void
}

export function OptimizationForm({ onOptimize }: OptimizationFormProps) {
  const [numberOfDays, setNumberOfDays] = useState('')
  const [strategy, setStrategy] = useState<OptimizationStrategy>('balanced')
  const [error, setError] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsOptimizing(true)

    const days = parseInt(numberOfDays, 10)
    if (isNaN(days) || days <= 0) {
      setError('Please enter a valid number greater than 0')
      setIsOptimizing(false)
      return
    }

    try {
      onOptimize(days, strategy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-sm mx-auto space-y-6">
      <div>
        <label htmlFor="ctoDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Number of CTO Days
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="ctoDays"
            id="ctoDays"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(e.target.value)}
            className={clsx(
              'block w-full rounded-md shadow-sm sm:text-sm transition-colors',
              'border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800/50',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-400 dark:placeholder-gray-500',
              'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
              error && 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
            )}
            placeholder="Enter number of days"
            min="1"
            required
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <div>
        <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Optimization Strategy
        </label>
        <select
          id="strategy"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as OptimizationStrategy)}
          className={clsx(
            'mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-colors',
            'border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800/50',
            'text-gray-900 dark:text-gray-100',
            'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
          )}
        >
          {OPTIMIZATION_STRATEGIES.map((strat) => (
            <option key={strat.id} value={strat.id}>
              {strat.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {OPTIMIZATION_STRATEGIES.find(s => s.id === strategy)?.description}
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isOptimizing}
          className={clsx(
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium',
            'text-white dark:text-gray-50',
            'bg-blue-600 dark:bg-blue-500',
            'hover:bg-blue-700 dark:hover:bg-blue-600',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize'}
        </button>
      </div>
    </form>
  )
}