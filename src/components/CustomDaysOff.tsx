"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CustomDayOff } from "@/services/optimizer"
import { format, parse } from "date-fns"
import { CalendarDays, Plus, X, Calendar, ArrowRight, CalendarCheck, CalendarX } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDaysOffProps {
  customDaysOff: CustomDayOff[]
  onChange: (customDaysOff: CustomDayOff[]) => void
}

const WEEKDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
]

export function CustomDaysOff({ customDaysOff, onChange }: CustomDaysOffProps) {
  const defaultCustomDay = {
    name: "",
    isRecurring: false,
    endDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    weekday: 1, // Default to Monday
    date: new Date().toISOString().split('T')[0],
  }

  const [newCustomDay, setNewCustomDay] = useState<Partial<CustomDayOff>>(defaultCustomDay)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddCustomDay = () => {
    if (!newCustomDay.name) return

    if (newCustomDay.isRecurring) {
      if (!newCustomDay.startDate || !newCustomDay.endDate || !newCustomDay.weekday === undefined) return
    } else {
      if (!newCustomDay.date) return
    }

    onChange([...customDaysOff, newCustomDay as CustomDayOff])
    setNewCustomDay(defaultCustomDay)
    setIsAdding(false)
  }

  const handleRemoveCustomDay = (index: number) => {
    onChange(customDaysOff.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="space-y-6" role="region" aria-label="Custom days off management">
      {/* Existing Custom Days */}
      {customDaysOff.length > 0 && (
        <div className="grid gap-3" role="list" aria-label="Added custom days off">
          {customDaysOff.map((day, index) => (
            <div 
              key={index} 
              className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200"
              role="listitem"
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
                  <h4 className="font-medium text-gray-900 dark:text-white">{day.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {day.isRecurring
                      ? `${WEEKDAYS.find(w => w.value === day.weekday?.toString())?.label}s from ${format(parse(day.startDate!, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')} to ${format(parse(day.endDate!, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}`
                      : format(parse(day.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCustomDay(index)}
                onKeyDown={(e) => handleKeyDown(e, () => handleRemoveCustomDay(index))}
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-opacity"
                aria-label={`Remove ${day.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Custom Day */}
      {!isAdding ? (
        <Button
          type="button"
          variant="outline"
          className="w-full bg-white dark:bg-gray-800/60 border-2 border-dashed border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 h-auto py-4 rounded-xl shadow-sm transition-all duration-200"
          onClick={() => setIsAdding(true)}
          onKeyDown={(e) => handleKeyDown(e, () => setIsAdding(true))}
          aria-expanded={isAdding}
        >
          <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
          Add Custom Day Off
        </Button>
      ) : (
        <div className="bg-white dark:bg-gray-800/60 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm space-y-6" role="form" aria-label="Add new custom day off">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium text-gray-900 dark:text-white">Name of Custom Day Off</Label>
              <Input
                id="name"
                value={newCustomDay.name}
                onChange={(e) => setNewCustomDay({ ...newCustomDay, name: e.target.value })}
                placeholder="e.g., Summer Fridays"
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 dark:placeholder-gray-500"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Day off type">
              <Button
                type="button"
                variant="outline"
                role="radio"
                aria-checked={!newCustomDay.isRecurring}
                className={cn(
                  "relative border-2 h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200",
                  !newCustomDay.isRecurring
                    ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 dark:border-teal-400 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                )}
                onClick={() => setNewCustomDay({ ...newCustomDay, isRecurring: false })}
                onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, isRecurring: false }))}
              >
                <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">Single Day</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">One-time occurrence</div>
                </div>
                {!newCustomDay.isRecurring && (
                  <div className="absolute top-2 right-2">
                    <CalendarCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                role="radio"
                aria-checked={newCustomDay.isRecurring}
                className={cn(
                  "relative border-2 h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200",
                  newCustomDay.isRecurring
                    ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-400 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                )}
                onClick={() => setNewCustomDay({ ...newCustomDay, isRecurring: true })}
                onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, isRecurring: true }))}
              >
                <CalendarDays className="h-6 w-6 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">Recurring Pattern</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Repeats weekly</div>
                </div>
                {newCustomDay.isRecurring && (
                  <div className="absolute top-2 right-2">
                    <CalendarCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
              </Button>
            </div>

            {newCustomDay.isRecurring ? (
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-900 dark:text-white">Select Day of Week</Label>
                  <div 
                    className="grid grid-cols-7 gap-2" 
                    role="radiogroup" 
                    aria-label="Select day of the week"
                  >
                    {WEEKDAYS.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant="outline"
                        role="radio"
                        aria-checked={newCustomDay.weekday === parseInt(day.value)}
                        className={cn(
                          "border h-auto py-2 px-1 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all duration-200",
                          newCustomDay.weekday === parseInt(day.value)
                            ? "bg-violet-50 dark:bg-violet-900/20 border-violet-500 dark:border-violet-400 shadow-sm"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        )}
                        onClick={() => setNewCustomDay({ ...newCustomDay, weekday: parseInt(day.value) })}
                        onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, weekday: parseInt(day.value) }))}
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{day.label.slice(0, 3)}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-base font-medium text-gray-900 dark:text-white">Start Date</Label>
                    <div className="relative">
                      <Input
                        id="startDate"
                        type="date"
                        value={newCustomDay.startDate}
                        onChange={(e) =>
                          setNewCustomDay({
                            ...newCustomDay,
                            startDate: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10"
                        aria-required="true"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-base font-medium text-gray-900 dark:text-white">End Date</Label>
                    <div className="relative">
                      <Input
                        id="endDate"
                        type="date"
                        value={newCustomDay.endDate}
                        onChange={(e) =>
                          setNewCustomDay({
                            ...newCustomDay,
                            endDate: e.target.value,
                          })
                        }
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10"
                        aria-required="true"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-medium text-gray-900 dark:text-white">Select Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={newCustomDay.date}
                    onChange={(e) =>
                      setNewCustomDay({
                        ...newCustomDay,
                        date: e.target.value,
                      })
                    }
                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 dark:text-gray-100 pl-10"
                    aria-required="true"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
              onClick={() => {
                setNewCustomDay(defaultCustomDay)
                setIsAdding(false)
              }}
              onKeyDown={(e) => handleKeyDown(e, () => {
                setNewCustomDay(defaultCustomDay)
                setIsAdding(false)
              })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={cn(
                "flex-1 text-white dark:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                newCustomDay.isRecurring
                  ? "bg-violet-500 hover:bg-violet-600 dark:bg-violet-400 dark:hover:bg-violet-300"
                  : "bg-teal-500 hover:bg-teal-600 dark:bg-teal-400 dark:hover:bg-teal-300"
              )}
              onClick={handleAddCustomDay}
              onKeyDown={(e) => handleKeyDown(e, handleAddCustomDay)}
              disabled={!newCustomDay.name || (newCustomDay.isRecurring ? (!newCustomDay.startDate || !newCustomDay.endDate || newCustomDay.weekday === undefined) : !newCustomDay.date)}
              aria-label="Add custom day off"
            >
              Add Day Off
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 