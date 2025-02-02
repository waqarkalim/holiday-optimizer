'use client'

import { useState } from "react"
import { OptimizerForm } from "@/components/OptimizerForm"
import { OptimizedDay, optimizeCtoDays, OptimizationStrategy, CustomDayOff } from "@/services/optimizer"
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ResultsDisplay } from "@/components/features/optimizer/ResultsDisplay"
import { cn } from "@/lib/utils"

interface OptimizeParams {
  days: number
  strategy: OptimizationStrategy
  customDaysOff: CustomDayOff[]
}

const HomePage = () => {
  const [optimizedDays, setOptimizedDays] = useState<OptimizedDay[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customDaysOff, setCustomDaysOff] = useState<CustomDayOff[]>([])

  const handleOptimize = async ({ days, strategy }: Omit<OptimizeParams, 'customDaysOff'>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = optimizeCtoDays(days, strategy, new Date().getFullYear(), customDaysOff)
      setOptimizedDays(result.days)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during optimization')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentYear={new Date().getFullYear()} />
      <main className="flex-grow">
        {/* Title Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Plan Your Time Off
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Optimize your CTO days for maximum time off in {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[calc(100vh-20rem)] relative">
          <div className="max-w-[1800px] mx-auto">
            <div className={cn(
              "grid gap-8 px-4 sm:px-6 lg:px-8 py-8",
              optimizedDays ? "lg:grid-cols-[400px,1fr] xl:grid-cols-[480px,1fr]" : ""
            )}>
              {/* Form Section */}
              <div className={cn(
                "transition-all duration-500 ease-in-out",
                optimizedDays ? "" : "max-w-xl mx-auto w-full"
              )}>
                <div className="lg:sticky lg:top-8">
                  <OptimizerForm 
                    onSubmit={handleOptimize} 
                    isLoading={isLoading} 
                    customDaysOff={customDaysOff}
                    onCustomDaysOffChange={setCustomDaysOff}
                  />
                </div>
              </div>

              {/* Results Section */}
              {optimizedDays && !isLoading && (
                <div className="min-w-0">
                  <ResultsDisplay optimizedDays={optimizedDays} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
