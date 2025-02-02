"use client"

import { useState, FormEvent, ChangeEvent, KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CustomDaysOff } from './CustomDaysOff'
import { 
  OptimizationStrategy,
  OPTIMIZATION_STRATEGIES,
  CustomDayOff
} from '@/services/optimizer'
import { Calendar, Sparkles, Shuffle, Coffee, Sunrise, Palmtree } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptimizerFormProps {
  onSubmit: (data: {
    days: number
    strategy: OptimizationStrategy
    customDaysOff: CustomDayOff[]
  }) => void
  isLoading?: boolean
}

export function OptimizerForm({ onSubmit, isLoading = false }: OptimizerFormProps) {
  const [days, setDays] = useState<string>("")
  const [strategy, setStrategy] = useState<OptimizationStrategy>("balanced")
  const [customDaysOff, setCustomDaysOff] = useState<CustomDayOff[]>([])

  const handleDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setDays("")
      return
    }
    
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      setDays(Math.max(0, Math.min(365, numValue)).toString())
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numDays = parseInt(days)
    if (numDays > 0) {
      onSubmit({ 
        days: numDays, 
        strategy, 
        customDaysOff 
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-gray-800/80 dark:to-gray-800/40 rounded-xl p-6 ring-1 ring-teal-900/10 dark:ring-teal-300/10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8" role="form" aria-label="Time off optimizer form">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-teal-900 dark:text-teal-100 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              Optimize Your Time Off
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure your preferences to get the most out of your CTO days.
            </p>
          </div>

          <div className="space-y-8">
            {/* Days Input */}
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-4 ring-1 ring-teal-900/5 dark:ring-teal-300/10 space-y-4" role="group" aria-labelledby="days-label">
              <div>
                <Label id="days-label" htmlFor="days" className="text-base font-medium text-teal-900 dark:text-teal-100">
                  How many CTO days do you have?
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1" id="days-description">
                  Enter the number of CTO days you have available.
                </p>
              </div>
              <div>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={handleDaysChange}
                  className="max-w-[200px] bg-white dark:bg-gray-900 border-teal-200 dark:border-teal-800 focus:border-teal-400 dark:focus:border-teal-600 text-lg text-teal-900 dark:text-teal-100"
                  required
                  aria-describedby="days-description days-error"
                  aria-invalid={days !== "" && parseInt(days) <= 0}
                />
                {days !== "" && parseInt(days) <= 0 && (
                  <p id="days-error" className="text-sm text-red-500 dark:text-red-400 mt-1">
                    Please enter a number greater than 0
                  </p>
                )}
              </div>
            </div>

            {/* Strategy Selection */}
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-4 ring-1 ring-blue-900/5 dark:ring-blue-300/10 space-y-4" role="group" aria-labelledby="strategy-label">
              <div>
                <Label id="strategy-label" className="text-base font-medium text-blue-900 dark:text-blue-100">
                  How would you like to optimize your time off?
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1" id="strategy-description">
                  Choose a strategy that matches your preferred vacation style.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Select optimization strategy">
                {OPTIMIZATION_STRATEGIES.map((strategyOption) => {
                  const icons = {
                    balanced: Shuffle,
                    longWeekends: Coffee,
                    weekLongBreaks: Sunrise,
                    extendedVacations: Palmtree
                  };
                  const Icon = icons[strategyOption.id];
                  
                  return (
                    <button
                      key={strategyOption.id}
                      type="button"
                      role="radio"
                      aria-checked={strategy === strategyOption.id}
                      className={cn(
                        "relative p-4 rounded-lg transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600",
                        strategy === strategyOption.id
                          ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-900/20 ring-1 ring-blue-900/10 dark:ring-blue-400/10"
                          : "bg-white dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-800"
                      )}
                      onClick={() => setStrategy(strategyOption.id)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setStrategy(strategyOption.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-md",
                          strategy === strategyOption.id
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        )}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="space-y-1 text-left">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            {strategyOption.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {strategyOption.description}
                          </p>
                        </div>
                      </div>
                      {strategy === strategyOption.id && (
                        <div className="absolute top-2 right-2">
                          <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Days Off */}
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-4 ring-1 ring-violet-900/5 dark:ring-violet-300/10">
              <div className="mb-4">
                <Label id="custom-days-label" className="text-base font-medium text-violet-900 dark:text-violet-100">
                  Add custom days off
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Include company holidays or other regular days off.
                </p>
              </div>
              <div>
                <CustomDaysOff
                  customDaysOff={customDaysOff}
                  onChange={setCustomDaysOff}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading || !days || parseInt(days) <= 0}
            className={cn(
              "bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-500 dark:to-blue-500",
              "hover:from-teal-500 hover:to-blue-500 dark:hover:from-teal-400 dark:hover:to-blue-400",
              "text-white shadow-sm hover:shadow-md transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed px-8",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            )}
            aria-label={isLoading ? "Optimizing..." : "Optimize Calendar"}
          >
            <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
            {isLoading ? "Optimizing..." : "Optimize Calendar"}
          </Button>
        </div>
      </form>
    </div>
  )
} 