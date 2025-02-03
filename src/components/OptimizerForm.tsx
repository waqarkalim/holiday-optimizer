"use client"

import { FormEvent, KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { OptimizationStrategy, CustomDayOff, OPTIMIZATION_STRATEGIES, StrategyOption } from '@/services/optimizer.dp'
import { format, parse } from "date-fns"
import { 
  Calendar, 
  Sparkles, 
  Shuffle, 
  Coffee, 
  Sunrise, 
  Palmtree,
  CalendarDays,
  Plus,
  X,
  CalendarCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOptimizer } from "@/contexts/OptimizerContext"
import { logger } from "@/utils/logger"

const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
] as const

interface OptimizerFormProps {
  onSubmit: (data: {
    days: number
    strategy: OptimizationStrategy
    customDaysOff: CustomDayOff[]
  }) => void
  isLoading?: boolean
}

type CustomDayField = keyof Partial<CustomDayOff>

// Update the icons type to match strategy IDs
const STRATEGY_ICONS: Record<OptimizationStrategy, typeof Shuffle> = {
  balanced: Shuffle,
  longWeekends: Coffee,
  weekLongBreaks: Sunrise,
  extendedVacations: Palmtree
}

export function OptimizerForm({ onSubmit, isLoading = false }: OptimizerFormProps) {
  const { state, dispatch } = useOptimizer()
  const { days, strategy, errors, customDaysOff, isAdding, newCustomDay } = state

  logger.debug('OptimizerForm rendered', {
    component: 'OptimizerForm',
    data: { days, strategy, isAdding, customDaysOffCount: customDaysOff.length }
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    logger.debug('Form submit event triggered', {
      component: 'OptimizerForm',
      action: 'handleSubmit',
      data: { 
        eventType: e.type,
        target: (e.target as HTMLFormElement).getAttribute('aria-label'),
        customDaysOff  // Log custom days for debugging
      }
    })
    
    const numDays = parseInt(days)
    
    logger.info('Form submission attempted', {
      component: 'OptimizerForm',
      action: 'handleSubmit',
      data: { days: numDays, strategy, customDaysOff }
    })

    if (numDays > 0) {
      logger.debug('Form submission valid', {
        component: 'OptimizerForm',
        action: 'handleSubmit',
        data: { days: numDays, strategy, customDaysOff }
      })
      onSubmit({ 
        days: numDays, 
        strategy,
        customDaysOff  // Make sure customDaysOff is included in submission
      })
    } else {
      logger.warn('Invalid days value in form submission', {
        component: 'OptimizerForm',
        action: 'handleSubmit',
        data: { days, numDays }
      })
      return
    }
  }

  const handleCustomDayAdd = () => {
    logger.info('Adding new custom day', {
      component: 'OptimizerForm',
      action: 'handleCustomDayAdd',
      data: { newCustomDay }
    })

    if (!newCustomDay.name) {
      logger.warn('Attempted to add custom day without name', {
        component: 'OptimizerForm',
        data: { newCustomDay }
      })
      return
    }

    // Ensure all required fields are present based on type
    if (newCustomDay.isRecurring && (!newCustomDay.startDate || !newCustomDay.endDate || newCustomDay.weekday === undefined)) {
      logger.warn('Attempted to add incomplete recurring custom day', {
        component: 'OptimizerForm',
        data: { newCustomDay }
      })
      return
    }

    if (!newCustomDay.isRecurring && !newCustomDay.date) {
      logger.warn('Attempted to add single custom day without date', {
        component: 'OptimizerForm',
        data: { newCustomDay }
      })
      return
    }

    dispatch({ type: 'ADD_CUSTOM_DAY', payload: newCustomDay as CustomDayOff })
    
    logger.debug('Custom day added successfully', {
      component: 'OptimizerForm',
      action: 'handleCustomDayAdd',
      data: { addedDay: newCustomDay }
    })

    // Reset form and close it
    dispatch({ type: 'RESET_NEW_CUSTOM_DAY' })
    dispatch({ type: 'SET_IS_ADDING', payload: false })
  }

  const handleCustomDayRemove = (index: number) => {
    logger.info('Removing custom day', {
      component: 'OptimizerForm',
      action: 'handleCustomDayRemove',
      data: { removedDay: customDaysOff[index], index }
    })
    dispatch({ type: 'REMOVE_CUSTOM_DAY', payload: index })
  }

  const handleCustomDayUpdate = (field: CustomDayField, value: any) => {
    logger.debug('Updating custom day field', {
      component: 'OptimizerForm',
      action: 'handleCustomDayUpdate',
      data: { field, value, previousValue: newCustomDay[field] }
    })
    dispatch({ type: 'UPDATE_NEW_CUSTOM_DAY', payload: { [field]: value } })
  }

  const handleStrategyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIMIZATION_STRATEGIES.findIndex(s => s.id === strategy)
    const lastIndex = OPTIMIZATION_STRATEGIES.length - 1
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault()
        const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
        const prevStrategy = OPTIMIZATION_STRATEGIES[prevIndex]
        dispatch({ type: 'SET_STRATEGY', payload: prevStrategy.id })
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${prevStrategy.id}"]`)
        radioInput?.focus()
        break
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault()
        const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
        const nextStrategy = OPTIMIZATION_STRATEGIES[nextIndex]
        dispatch({ type: 'SET_STRATEGY', payload: nextStrategy.id })
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${nextStrategy.id}"]`)
        radioInput?.focus()
        break
      }
    }
  }

  const handleWeekdayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowLeft': {
        e.preventDefault()
        const prevIndex = index === 0 ? WEEKDAYS.length - 1 : index - 1
        handleCustomDayUpdate('weekday', parseInt(WEEKDAYS[prevIndex].value))
        const weekdayButton = document.querySelector<HTMLButtonElement>(`[data-weekday-index="${prevIndex}"]`)
        weekdayButton?.focus()
        break
      }
      case 'ArrowRight': {
        e.preventDefault()
        const nextIndex = (index + 1) % WEEKDAYS.length
        handleCustomDayUpdate('weekday', parseInt(WEEKDAYS[nextIndex].value))
        const weekdayButton = document.querySelector<HTMLButtonElement>(`[data-weekday-index="${nextIndex}"]`)
        weekdayButton?.focus()
        break
      }
    }
  }

  const handleCustomDaysKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      dispatch({ type: 'SET_IS_ADDING', payload: true })
    }
  }

  return (
    <main className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-gray-800/80 dark:to-gray-800/40 rounded-xl p-4 ring-1 ring-teal-900/10 dark:ring-teal-300/10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Time off optimizer">
        <div className="space-y-4">
          <header>
            <h1 className="text-xl font-semibold text-teal-900 dark:text-teal-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              Optimize Your Time Off
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Configure your preferences to get the most out of your CTO days.
            </p>
          </header>

          <div className="space-y-4">
            {/* Days Input Section */}
            <section 
              className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-3 ring-1 ring-teal-900/5 dark:ring-teal-300/10 space-y-3" 
              aria-labelledby="days-heading"
            >
              <header>
                <h2 id="days-heading" className="text-sm font-medium text-teal-900 dark:text-teal-100">
                  How many CTO days do you have?
                </h2>
                <p id="days-description" className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Enter the number of CTO days you have available.
                </p>
              </header>
              <div>
                <Input
                  autoFocus
                  id="days"
                  name="days"
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => {
                    logger.debug('Days input changed', {
                      component: 'OptimizerForm',
                      action: 'daysChange',
                      data: { newValue: e.target.value, oldValue: days }
                    })
                    dispatch({ type: 'SET_DAYS', payload: e.target.value })
                  }}
                  className={cn(
                    "max-w-[160px] bg-white dark:bg-gray-900 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 text-base text-teal-900 dark:text-teal-100",
                    errors.days && "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                  )}
                  required
                  aria-describedby="days-description days-error"
                  aria-invalid={!!errors.days}
                  aria-errormessage={errors.days ? "days-error" : undefined}
                />
                {errors.days && (
                  <p id="days-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.days}
                  </p>
                )}
              </div>
            </section>

            {/* Strategy Selection Section */}
            <section 
              className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-3 ring-1 ring-blue-900/5 dark:ring-blue-300/10 space-y-3"
              aria-labelledby="strategy-heading"
            >
              <header>
                <h2 id="strategy-heading" className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  How would you like to optimize your time off?
                </h2>
                <p id="strategy-description" className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Choose a strategy that matches your preferred vacation style.
                </p>
              </header>
              <div 
                role="radiogroup" 
                aria-labelledby="strategy-heading"
                aria-describedby="strategy-description"
                className="space-y-2"
                onKeyDown={handleStrategyKeyDown}
              >
                {OPTIMIZATION_STRATEGIES.map((strategyOption, index) => {
                  const Icon = STRATEGY_ICONS[strategyOption.id]
                  const isSelected = strategy === strategyOption.id
                  
                  return (
                    <label
                      key={strategyOption.id}
                      className={cn(
                        "flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer",
                        "focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600",
                        isSelected
                          ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-900/20 ring-1 ring-blue-900/10 dark:ring-blue-400/10"
                          : "bg-white dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-800"
                      )}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        value={strategyOption.id}
                        checked={isSelected}
                        className="sr-only"
                        tabIndex={isSelected || (index === 0 && !strategy) ? 0 : -1}
                        onChange={() => dispatch({ type: 'SET_STRATEGY', payload: strategyOption.id })}
                      />
                      <div className="flex items-center gap-3 w-full">
                        <div className={cn(
                          "p-1.5 rounded-md",
                          isSelected
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        )}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {strategyOption.label}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {strategyOption.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300 flex-shrink-0" />
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Custom Days Off Section */}
            <section 
              className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-3 ring-1 ring-violet-900/5 dark:ring-violet-300/10"
              aria-labelledby="custom-days-heading"
            >
              <header className="mb-3">
                <h2 id="custom-days-heading" className="text-sm font-medium text-violet-900 dark:text-violet-100">
                  Add custom days off
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Include company holidays or other regular days off.
                </p>
              </header>
              <div className="space-y-6">
                {/* Existing Custom Days List */}
                {customDaysOff.length > 0 && (
                  <ul className="grid gap-3" aria-label="Added custom days off">
                    {customDaysOff.map((day, index) => (
                      <li 
                        key={index} 
                        className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          {day.isRecurring ? (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <CalendarDays className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{day.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {day.isRecurring
                                ? `${WEEKDAYS.find(w => w.value === day.weekday?.toString())?.label}s from ${format(parse(day.startDate!, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')} to ${format(parse(day.endDate!, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}`
                                : format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCustomDayRemove(index)}
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity focus:opacity-100"
                          aria-label={`Remove ${day.name}`}
                          tabIndex={0}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add New Custom Day Button/Form */}
                {!isAdding ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white dark:bg-gray-800/60 border-2 border-dashed border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 h-auto py-4 rounded-xl shadow-sm transition-all duration-200"
                    onClick={() => dispatch({ type: 'SET_IS_ADDING', payload: true })}
                    onKeyDown={handleCustomDaysKeyDown}
                    aria-expanded={isAdding}
                    aria-controls="custom-day-form"
                    tabIndex={0}
                  >
                    <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                    Add Custom Day Off
                  </Button>
                ) : (
                  <div 
                    id="custom-day-form"
                    className="bg-white dark:bg-gray-800/60 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm space-y-6"
                    role="form" 
                    aria-label="Add new custom day off"
                  >
                    <fieldset className="space-y-5">
                      <legend className="sr-only">Custom day off details</legend>
                      
                      {/* Name Input */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-white">Name of Custom Day Off</Label>
                        <Input
                          id="name"
                          name="customDayName"
                          value={newCustomDay.name}
                          onChange={(e) => handleCustomDayUpdate('name', e.target.value)}
                          placeholder="e.g., Summer Fridays"
                          className={cn(
                            "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 dark:placeholder-gray-500",
                            errors.customDay?.name && "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                          )}
                          aria-required="true"
                          aria-invalid={!!errors.customDay?.name}
                          aria-errormessage={errors.customDay?.name ? "name-error" : undefined}
                        />
                        {errors.customDay?.name && (
                          <p id="name-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                            {errors.customDay.name}
                          </p>
                        )}
                      </div>

                      {/* Type Selection */}
                      <fieldset className="grid grid-cols-2 gap-4">
                        <legend className="sr-only">Day off type</legend>
                        <Button
                          type="button"
                          name="dayType"
                          value="single"
                          variant="outline"
                          role="radio"
                          aria-checked={!newCustomDay.isRecurring}
                          tabIndex={0}
                          className={cn(
                            "relative border-2 h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200",
                            !newCustomDay.isRecurring
                              ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-400 shadow-sm"
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          )}
                          onClick={() => handleCustomDayUpdate('isRecurring', false)}
                        >
                          <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                          <div className="text-center">
                            <div className="font-medium text-gray-900 dark:text-white">Single Day</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">One-time occurrence</div>
                          </div>
                          {!newCustomDay.isRecurring && (
                            <span className="absolute top-2 right-2" aria-label="Selected">
                              <CalendarCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </span>
                          )}
                        </Button>
                        <Button
                          type="button"
                          name="dayType"
                          value="recurring"
                          variant="outline"
                          role="radio"
                          aria-checked={newCustomDay.isRecurring}
                          tabIndex={0}
                          className={cn(
                            "relative border-2 h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200",
                            newCustomDay.isRecurring
                              ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-400 shadow-sm"
                              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          )}
                          onClick={() => handleCustomDayUpdate('isRecurring', true)}
                        >
                          <CalendarDays className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                          <div className="text-center">
                            <div className="font-medium text-gray-900 dark:text-white">Recurring Pattern</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Repeats weekly</div>
                          </div>
                          {newCustomDay.isRecurring && (
                            <span className="absolute top-2 right-2" aria-label="Selected">
                              <CalendarCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </span>
                          )}
                        </Button>
                      </fieldset>

                      {/* Recurring or Single Day Fields */}
                      {newCustomDay.isRecurring ? (
                        <fieldset className="space-y-5">
                          <legend className="sr-only">Recurring day details</legend>
                          <div className="space-y-3">
                            <Label id="weekday-label" className="text-base font-medium text-gray-900 dark:text-white">Select Day of Week</Label>
                            <div 
                              className="grid grid-cols-7 gap-2" 
                              role="radiogroup" 
                              aria-labelledby="weekday-label"
                            >
                              {WEEKDAYS.map((day, index) => (
                                <Button
                                  key={day.value}
                                  type="button"
                                  variant="outline"
                                  role="radio"
                                  aria-checked={newCustomDay.weekday === parseInt(day.value)}
                                  tabIndex={newCustomDay.weekday === parseInt(day.value) ? 0 : -1}
                                  className={cn(
                                    "border h-auto py-2 px-1 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-200",
                                    newCustomDay.weekday === parseInt(day.value)
                                      ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-400 shadow-sm"
                                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                  )}
                                  onClick={() => handleCustomDayUpdate('weekday', parseInt(day.value))}
                                  onKeyDown={(e) => handleWeekdayKeyDown(e, index)}
                                  data-weekday-index={index}
                                >
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {day.label.slice(0, 3)}
                                  </span>
                                </Button>
                              ))}
                            </div>
                            {errors.customDay?.weekday && (
                              <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                                {errors.customDay.weekday}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startDate" className="text-base font-medium text-gray-900 dark:text-white">Start Date</Label>
                              <div className="relative">
                                <Input
                                  id="startDate"
                                  name="startDate"
                                  type="date"
                                  value={newCustomDay.startDate}
                                  onChange={(e) => handleCustomDayUpdate('startDate', e.target.value)}
                                  className={cn(
                                    "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10",
                                    errors.customDay?.startDate && "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                  )}
                                  aria-required="true"
                                  aria-invalid={!!errors.customDay?.startDate}
                                  aria-errormessage={errors.customDay?.startDate ? "startDate-error" : undefined}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                              </div>
                              {errors.customDay?.startDate && (
                                <p id="startDate-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                                  {errors.customDay.startDate}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate" className="text-base font-medium text-gray-900 dark:text-white">End Date</Label>
                              <div className="relative">
                                <Input
                                  id="endDate"
                                  name="endDate"
                                  type="date"
                                  value={newCustomDay.endDate}
                                  onChange={(e) => handleCustomDayUpdate('endDate', e.target.value)}
                                  className={cn(
                                    "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10",
                                    errors.customDay?.endDate && "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                  )}
                                  aria-required="true"
                                  aria-invalid={!!errors.customDay?.endDate}
                                  aria-errormessage={errors.customDay?.endDate ? "endDate-error" : undefined}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                              </div>
                              {errors.customDay?.endDate && (
                                <p id="endDate-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                                  {errors.customDay.endDate}
                                </p>
                              )}
                            </div>
                          </div>
                        </fieldset>
                      ) : (
                        /* Single Date */
                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-base font-medium text-gray-900 dark:text-white">Select Date</Label>
                          <div className="relative">
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              value={newCustomDay.date}
                              onChange={(e) => handleCustomDayUpdate('date', e.target.value)}
                              className={cn(
                                "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10",
                                errors.customDay?.date && "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                              )}
                              aria-required="true"
                              aria-invalid={!!errors.customDay?.date}
                              aria-errormessage={errors.customDay?.date ? "date-error" : undefined}
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400 dark:text-violet-500" aria-hidden="true" />
                          </div>
                          {errors.customDay?.date && (
                            <p id="date-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">
                              {errors.customDay.date}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Form Actions */}
                      <div 
                        className="flex gap-3 pt-2"
                        role="group"
                        aria-label="Form actions"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
                          onClick={() => {
                            dispatch({ type: 'RESET_NEW_CUSTOM_DAY' })
                            dispatch({ type: 'SET_IS_ADDING', payload: false })
                          }}
                          tabIndex={0}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className={cn(
                            "flex-1 text-white dark:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                            "bg-violet-500 hover:bg-violet-600 dark:bg-violet-400 dark:hover:bg-violet-300"
                          )}
                          onClick={handleCustomDayAdd}
                          disabled={!newCustomDay.name || (newCustomDay.isRecurring ? (!newCustomDay.startDate || !newCustomDay.endDate || newCustomDay.weekday === undefined) : !newCustomDay.date)}
                          aria-label="Add custom day off"
                          tabIndex={0}
                        >
                          Add Day Off
                        </Button>
                      </div>
                    </fieldset>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        <footer className="flex justify-end">
          <Button 
            type="submit" 
            size="default" 
            disabled={isLoading || !days || parseInt(days) <= 0}
            className={cn(
              "bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-500 dark:to-blue-500",
              "hover:from-teal-500 hover:to-blue-500 dark:hover:from-teal-400 dark:hover:to-blue-400",
              "text-white shadow-sm hover:shadow-md transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed px-6",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            )}
            aria-label={isLoading ? "Optimizing..." : "Optimize Calendar"}
            tabIndex={0}
          >
            <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
            {isLoading ? "Optimizing..." : "Optimize Calendar"}
          </Button>
        </footer>
      </form>
    </main>
  )
} 