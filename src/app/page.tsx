'use client'

import { useState } from 'react'
import { optimizeCtoDays, OptimizedDay, OptimizationStrategy, OPTIMIZATION_STRATEGIES } from '@/services/optimizer'
import { ResultsDisplay } from '@/components/features/optimizer/ResultsDisplay'

export default function Home() {
  const [numDays, setNumDays] = useState<number>(10)
  const [strategy, setStrategy] = useState<OptimizationStrategy>('balanced')
  const [result, setResult] = useState<{ days: OptimizedDay[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = () => {
    try {
      setError(null)
      const optimizationResult = optimizeCtoDays(numDays, strategy)
      setResult(optimizationResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Holiday Optimizer 2025</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="mb-6">
            <label htmlFor="numDays" className="block text-sm font-medium text-gray-700 mb-2">
              Number of CTO Days
            </label>
            <input
              type="number"
              id="numDays"
              min="1"
              max="25"
              value={numDays}
              onChange={(e) => setNumDays(Math.max(1, Math.min(25, parseInt(e.target.value) || 0)))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Strategy
            </label>
            <select
              id="strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as OptimizationStrategy)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {OPTIMIZATION_STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {OPTIMIZATION_STRATEGIES.find(s => s.id === strategy)?.description}
            </p>
          </div>

          <button
            onClick={handleOptimize}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Optimize Holidays
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <ResultsDisplay 
            optimizedDays={result.days}
          />
        )}
      </div>
    </main>
  )
}
