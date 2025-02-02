'use client'

import { useState } from 'react'
import { OptimizationForm } from '@/components/features/optimizer/OptimizationForm'
import { ResultsDisplay } from '@/components/features/optimizer/ResultsDisplay'
import { optimizeCtoDays } from '@/services/optimizer'
import type { OptimizedDay, AlternativeDay, OptimizationStrategy } from '@/services/optimizer'

export default function Home() {
  const [optimizationResult, setOptimizationResult] = useState<{
    days: OptimizedDay[]
    alternatives: AlternativeDay[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async (numberOfDays: number, strategy: OptimizationStrategy) => {
    try {
      setError(null)
      const result = optimizeCtoDays(numberOfDays, strategy)
      setOptimizationResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
              CTO Days Optimizer
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Maximize your time off by optimizing how you use your CTO days.
            </p>
          </div>
          
          <div className="mt-12 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm dark:shadow-gray-900/20 ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Enter Your CTO Days
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Input the number of CTO days you have available and choose your preferred break style.
            </p>
            <OptimizationForm onOptimize={handleOptimize} />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}

          {optimizationResult && (
            <div className="mt-8 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm dark:shadow-gray-900/20 ring-1 ring-gray-900/5 dark:ring-white/10 p-6">
              <ResultsDisplay 
                optimizedDays={optimizationResult.days} 
                alternatives={optimizationResult.alternatives}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
