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
  numberOfDays: number | null
  strategy: OptimizationStrategy
}

const DEFAULT_FORM_STATE: FormState = {
  numberOfDays: null,
  strategy: 'balanced'
}

const validateFormState = (state: FormState) => {
  const errors: Partial<Record<keyof FormState, string>> = {}
  
  if (state.numberOfDays === null || state.numberOfDays === undefined) {
    errors.numberOfDays = 'Please enter the number of CTO days'
  } else if (state.numberOfDays < 1) {
    errors.numberOfDays = 'Number of days must be at least 1'
  } else if (state.numberOfDays > 260) {
    errors.numberOfDays = 'Number of days cannot exceed 260'
  }
  
  return errors
}

const Header = () => (
  <header className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Holiday Optimizer
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">2025 Calendar</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/waqarkalim/holiday-optimizer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              bg-gray-100 text-gray-700 hover:bg-gray-200
              dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  </header>
)

const Footer = () => (
  <footer className="mt-auto border-t border-gray-200 dark:border-gray-700/50 bg-gradient-to-t from-white to-gray-50 dark:from-gray-800 dark:to-gray-900/50">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Holiday Optimizer
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} All rights reserved
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/waqarkalim/holiday-optimizer/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            Report an Issue
          </a>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Built with</span>
            <svg className="h-4 w-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400">by</span>
            <a
              href="https://github.com/waqarkalim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Waqar Kalim
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
)

const HomePage = () => {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set())
  
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

  const errors = validateFormState(formState)

  const handleFieldBlur = (field: keyof FormState) => {
    setTouched(prev => new Set([...prev, field]))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Plan Your Time Off
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Optimize your CTO days for maximum time off in 2025
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="space-y-8 bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
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
                        placeholder="Enter number of days"
                        min={1}
                        max={260}
                        value={formState.numberOfDays ?? ''}
                        onChange={e => {
                          const value = e.target.value
                          setFormState(prev => ({
                            ...prev,
                            numberOfDays: value === '' ? null : parseInt(value) || 0
                          }))
                        }}
                        onBlur={() => handleFieldBlur('numberOfDays')}
                        className={clsx(
                          'block w-full rounded-md pl-10 pr-12 py-2.5 text-gray-900 dark:text-gray-100 sm:text-sm',
                          'focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400',
                          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
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

              {isOptimizing && (
                <div className="flex justify-center items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Optimizing...
                </div>
              )}
            </div>
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
      <Footer />
    </div>
  )
}

export default HomePage
