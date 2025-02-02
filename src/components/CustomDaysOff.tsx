"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { CustomDayOff } from "@/services/optimizer"
import { format, parse } from "date-fns"
import { CalendarDays, Plus, X, Calendar, ArrowRight } from "lucide-react"
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
    <div className="space-y-4" role="region" aria-label="Custom days off management">
      {/* Existing Custom Days */}
      {customDaysOff.length > 0 && (
        <div className="grid gap-2" role="list" aria-label="Added custom days off">
          {customDaysOff.map((day, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 transition-colors rounded-lg border border-gray-200 dark:border-gray-700"
              role="listitem"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{day.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {day.isRecurring
                      ? `${WEEKDAYS.find(w => w.value === day.weekday?.toString())?.label}s from ${day.startDate} to ${day.endDate}`
                      : day.date}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveCustomDay(index)}
                onKeyDown={(e) => handleKeyDown(e, () => handleRemoveCustomDay(index))}
                className="h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
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
          className="w-full border border-dashed border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 h-auto py-3"
          onClick={() => setIsAdding(true)}
          onKeyDown={(e) => handleKeyDown(e, () => setIsAdding(true))}
          aria-expanded={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Custom Day Off
        </Button>
      ) : (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700" role="form" aria-label="Add new custom day off">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 dark:text-white">Name of Custom Day Off</Label>
              <Input
                id="name"
                value={newCustomDay.name}
                onChange={(e) => setNewCustomDay({ ...newCustomDay, name: e.target.value })}
                placeholder="e.g., Summer Fridays"
                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Day off type">
              <Button
                type="button"
                variant="outline"
                role="radio"
                aria-checked={!newCustomDay.isRecurring}
                className={cn(
                  "border h-auto py-3 flex flex-col gap-1",
                  !newCustomDay.isRecurring
                    ? "bg-white dark:bg-gray-900 border-gray-900 dark:border-white"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                )}
                onClick={() => setNewCustomDay({ ...newCustomDay, isRecurring: false })}
                onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, isRecurring: false }))}
              >
                <Calendar className="h-4 w-4 mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="font-medium text-gray-900 dark:text-white">Single Day</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">One-time occurrence</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                role="radio"
                aria-checked={newCustomDay.isRecurring}
                className={cn(
                  "border h-auto py-3 flex flex-col gap-1",
                  newCustomDay.isRecurring
                    ? "bg-white dark:bg-gray-900 border-gray-900 dark:border-white"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                )}
                onClick={() => setNewCustomDay({ ...newCustomDay, isRecurring: true })}
                onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, isRecurring: true }))}
              >
                <CalendarDays className="h-4 w-4 mb-1 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <span className="font-medium text-gray-900 dark:text-white">Recurring Pattern</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Repeats weekly</span>
              </Button>
            </div>

            {newCustomDay.isRecurring ? (
              <div className="space-y-4">
                <div 
                  className="grid grid-cols-2 sm:grid-cols-7 gap-2" 
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
                        "border h-auto py-2 px-1",
                        newCustomDay.weekday === parseInt(day.value)
                          ? "bg-white dark:bg-gray-900 border-gray-900 dark:border-white"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                      )}
                      onClick={() => setNewCustomDay({ ...newCustomDay, weekday: parseInt(day.value) })}
                      onKeyDown={(e) => handleKeyDown(e, () => setNewCustomDay({ ...newCustomDay, weekday: parseInt(day.value) }))}
                    >
                      <span className="text-gray-900 dark:text-white">{day.label.slice(0, 3)}</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-gray-900 dark:text-white">Start Date</Label>
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
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 dark:text-gray-100"
                      aria-required="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-gray-900 dark:text-white">End Date</Label>
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
                      className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 dark:text-gray-100"
                      aria-required="true"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-900 dark:text-white">Date</Label>
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
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600 dark:text-gray-100"
                  aria-required="true"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100"
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
              className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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