'use client'

import { useState } from 'react'
import { OptimizationForm } from '@/components/features/optimizer/OptimizationForm'
import { ResultsDisplay } from '@/components/features/optimizer/ResultsDisplay'

export default function Home() {
  const [optimizationResults, setOptimizationResults] = useState<any>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            CTO Days Optimizer
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Maximize your time off by optimizing how you use your CTO days.
          </p>
        </div>
        
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Enter Your CTO Days
          </h2>
          <p className="mt-2 text-gray-600">
            Input the number of CTO days you have available, and we&apos;ll help you plan the best days to take off.
          </p>
          <OptimizationForm onSuccess={setOptimizationResults} />
        </div>

        {optimizationResults && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <ResultsDisplay optimizedDays={optimizationResults.optimizedDays} />
          </div>
        )}
      </div>
    </main>
  )
}
