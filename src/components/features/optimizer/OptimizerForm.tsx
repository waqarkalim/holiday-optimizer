import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { type OptimizationStrategy } from '@/services/optimizer'
import { useDebounce } from '@/hooks/useDebounce'

export const STRATEGIES = [
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

export interface FormState {
  numberOfDays: number | null
  strategy: OptimizationStrategy
}

export const DEFAULT_FORM_STATE: FormState = {
  numberOfDays: null,
  strategy: 'balanced'
}

interface OptimizerFormProps {
  formState: FormState
  onFormChange: (newState: FormState) => void
  isOptimizing: boolean
  error: string | null
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

const OptimizerForm = ({ formState, onFormChange, isOptimizing, error }: OptimizerFormProps) => {
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set())
  const errors = validateFormState(formState)
  const [localDays, setLocalDays] = useState<string>(formState.numberOfDays?.toString() ?? '')
  const debouncedDays = useDebounce(localDays, 300)

  // Update form state when debounced value changes
  useEffect(() => {
    const value = debouncedDays === '' ? null : parseInt(debouncedDays) || 0
    if (value !== formState.numberOfDays) {
      onFormChange({
        ...formState,
        numberOfDays: value
      })
    }
  }, [debouncedDays, formState, onFormChange])

  const handleFieldBlur = (field: keyof FormState) => {
    setTouched(prev => new Set([...prev, field]))
  }

  return (
    <div className="space-y-8 bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
      <div className="space-y-8">
        {/* Number of Days Input */}
        <div>
          <label htmlFor="numberOfDays" className="block text-base font-medium text-gray-700 dark:text-gray-300">
            Number of CTO Days
          </label>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            How many CTO days would you like to optimize? 
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
                value={localDays}
                onChange={e => setLocalDays(e.target.value)}
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
            Choose how you&apos;d like your CTO days to be distributed
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {STRATEGIES.map(strategy => (
              <div
                key={strategy.id}
                onClick={() => onFormChange({ ...formState, strategy: strategy.id })}
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

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
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
    </div>
  )
}

export default OptimizerForm 