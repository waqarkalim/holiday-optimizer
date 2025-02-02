'use client'

import { useState, useMemo } from 'react'
import { optimizeCtoDays } from '@/services/optimizer'
import { ResultsDisplay } from '@/components/features/optimizer/ResultsDisplay'
import OptimizerForm, { DEFAULT_FORM_STATE, type FormState } from '@/components/features/optimizer/OptimizerForm'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const HomePage = () => {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE)
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  const { optimizedDays, error } = useMemo(() => {
    if (formState.numberOfDays === null) {
      return { optimizedDays: null, error: null }
    }

    try {
      setIsOptimizing(true)
      const result = optimizeCtoDays(formState.numberOfDays, formState.strategy)
      return { optimizedDays: result.days, error: null }
    } catch (e) {
      return { optimizedDays: null, error: e instanceof Error ? e.message : 'An error occurred' }
    } finally {
      setIsOptimizing(false)
    }
  }, [formState.numberOfDays, formState.strategy])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="flex-grow">
        {/* Title Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Plan Your Time Off
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Optimize your CTO days for maximum time off in 2025
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
          <div className={`grid gap-8 ${optimizedDays ? 'lg:grid-cols-[minmax(480px,1fr),minmax(480px,2fr)]' : ''} mx-auto max-w-[1400px]`}>
            {/* Form Section - Always visible */}
            <div className={`${optimizedDays ? 'lg:sticky lg:top-8 lg:self-start max-w-2xl' : 'max-w-xl mx-auto w-full'} space-y-6`}>
              <OptimizerForm
                formState={formState}
                onFormChange={setFormState}
                isOptimizing={isOptimizing}
                error={error}
              />
            </div>

            {/* Results Section - Appears when there are results */}
            {optimizedDays && (
              <div className="space-y-6 min-w-0 max-w-4xl">
                <ResultsDisplay optimizedDays={optimizedDays} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
