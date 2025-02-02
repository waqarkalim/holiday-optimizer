'use client'

import { useState, useMemo } from 'react'
import { optimizeCtoDays, type OptimizationStrategy } from '@/services/optimizer'
import { ResultsDisplay } from '@/components/features/optimizer/ResultsDisplay'
import clsx from 'clsx'

const STRATEGIES = [
  {
    id: 'balanced',
    label: 'Balanced Mix',
    description: 'A balanced mix of long weekends and longer breaks',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: 'Maximize the number of 3-4 day weekends',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: 'Focus on creating 5-7 day breaks',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: 'Combine days for longer vacations (8+ days)',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )
  }
] as const

interface FormState {
  numberOfDays: number
  strategy: OptimizationStrategy
}

const DEFAULT_FORM_STATE: FormState = {
  numberOfDays: 15,
  strategy: 'balanced'
}

const validateFormState = (state: FormState) => {
  const errors: Partial<Record<keyof FormState, string>> = {}
  
  if (state.numberOfDays < 1) {
    errors.numberOfDays = 'Number of days must be at least 1'
  }
  if (state.numberOfDays > 260) {
    errors.numberOfDays = 'Number of days cannot exceed 260'
  }
  
  return errors
}

const HomePage = () => {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set())
  
  const { optimizedDays, error } = useMemo(() => {
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

  const errors = validateFormState(formState)
  const hasErrors = Object.keys(errors).length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasErrors) {
      setFormState({ ...formState })
    }
  }

  const handleFieldBlur = (field: keyof FormState) => {
    setTouched(prev => new Set([...prev, field]))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Holiday Optimizer
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Optimize your CTO days for maximum time off in 2025
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="space-y-8">
              {/* Number of Days Input */}
              <div>
                <label htmlFor="numberOfDays" className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Number of CTO Days
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  How many CTO days would you like to optimize? (1-260 days)
                </p>
                <div className="mt-2">
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      name="numberOfDays"
                      id="numberOfDays"
                      min={1}
                      max={260}
                      value={formState.numberOfDays}
                      onChange={e => setFormState(prev => ({ ...prev, numberOfDays: parseInt(e.target.value) || 0 }))}
                      onBlur={() => handleFieldBlur('numberOfDays')}
                      className={clsx(
                        'block w-full rounded-md pl-10 pr-12 py-2.5 text-gray-900 dark:text-gray-100 sm:text-sm',
                        'focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400',
                        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                        errors.numberOfDays && touched.has('numberOfDays')
                          ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500'
                          : 'border-gray-300 dark:border-gray-600',
                        'dark:bg-gray-700/50'
                      )}
                      aria-invalid={errors.numberOfDays ? 'true' : 'false'}
                      aria-describedby={errors.numberOfDays ? 'numberOfDays-error' : undefined}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">days</span>
                    </div>
                  </div>
                  {errors.numberOfDays && touched.has('numberOfDays') && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="numberOfDays-error">
                      {errors.numberOfDays}
                    </p>
                  )}
                </div>
              </div>

              {/* Strategy Selection */}
              <div>
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                  Optimization Strategy
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose how you'd like your CTO days to be distributed
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {STRATEGIES.map(strategy => (
                    <div
                      key={strategy.id}
                      onClick={() => setFormState(prev => ({ ...prev, strategy: strategy.id }))}
                      className={clsx(
                        'relative rounded-lg border p-4 cursor-pointer focus:outline-none',
                        formState.strategy === strategy.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 ring-2 ring-blue-500 dark:ring-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      <div className="flex items-start">
                        <div className={clsx(
                          'flex-shrink-0 inline-flex p-2 rounded-lg',
                          formState.strategy === strategy.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        )}>
                          {strategy.icon}
                        </div>
                        <div className="ml-4">
                          <p className={clsx(
                            'text-sm font-medium',
                            formState.strategy === strategy.id
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-gray-900 dark:text-gray-100'
                          )}>
                            {strategy.label}
                          </p>
                          <p className={clsx(
                            'mt-1 text-sm',
                            formState.strategy === strategy.id
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-500 dark:text-gray-400'
                          )}>
                            {strategy.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={hasErrors || isOptimizing}
                className={clsx(
                  'inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  hasErrors || isOptimizing
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                )}
              >
                {isOptimizing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Optimizing...
                  </>
                ) : 'Optimize Holidays'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-8 max-w-3xl mx-auto rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Optimization Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {optimizedDays && (
          <div className="mt-8">
            <ResultsDisplay optimizedDays={optimizedDays} />
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
