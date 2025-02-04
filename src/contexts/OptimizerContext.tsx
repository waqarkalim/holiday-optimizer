import { createContext, useContext, useReducer, ReactNode } from 'react'
import { OptimizationStrategy, CustomDayOff } from '@/services/optimizer'
import { isAfter, isBefore, isValid, parse } from 'date-fns'
import { logger } from '@/utils/logger'

interface OptimizerState {
  days: string
  strategy: OptimizationStrategy
  customDaysOff: CustomDayOff[]
  isAdding: boolean
  newCustomDay: Partial<CustomDayOff>
  errors: {
    days?: string
    customDay?: {
      name?: string
      date?: string
      startDate?: string
      endDate?: string
      weekday?: string
    }
  }
}

type OptimizerAction =
  | { type: 'SET_DAYS'; payload: string }
  | { type: 'SET_STRATEGY'; payload: OptimizationStrategy }
  | { type: 'SET_CUSTOM_DAYS'; payload: CustomDayOff[] }
  | { type: 'ADD_CUSTOM_DAY'; payload: CustomDayOff }
  | { type: 'REMOVE_CUSTOM_DAY'; payload: number }
  | { type: 'SET_IS_ADDING'; payload: boolean }
  | { type: 'UPDATE_NEW_CUSTOM_DAY'; payload: Partial<CustomDayOff> }
  | { type: 'RESET_NEW_CUSTOM_DAY' }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }

export const defaultCustomDay: Partial<CustomDayOff> = {
  name: "",
  isRecurring: false,
  endDate: new Date().toISOString().split('T')[0],
  startDate: new Date().toISOString().split('T')[0],
  weekday: 1,
  date: new Date().toISOString().split('T')[0],
}

const initialState: OptimizerState = {
  days: "",
  strategy: "balanced",
  customDaysOff: [],
  isAdding: false,
  newCustomDay: defaultCustomDay,
  errors: {}
}

function validateCustomDay(day: Partial<CustomDayOff>): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!day.name?.trim()) {
    errors.name = "Name is required"
  }

  if (day.isRecurring) {
    if (!day.startDate || !isValid(parse(day.startDate, 'yyyy-MM-dd', new Date()))) {
      errors.startDate = "Valid start date is required"
    }
    if (!day.endDate || !isValid(parse(day.endDate, 'yyyy-MM-dd', new Date()))) {
      errors.endDate = "Valid end date is required"
    }
    if (day.startDate && day.endDate && isAfter(parse(day.startDate, 'yyyy-MM-dd', new Date()), parse(day.endDate, 'yyyy-MM-dd', new Date()))) {
      errors.endDate = "End date must be after start date"
    }
    if (day.weekday === undefined || day.weekday < 0 || day.weekday > 6) {
      errors.weekday = "Valid weekday is required"
    }
  } else {
    if (!day.date || !isValid(parse(day.date, 'yyyy-MM-dd', new Date()))) {
      errors.date = "Valid date is required"
    }
  }

  return errors
}

function optimizerReducer(state: OptimizerState, action: OptimizerAction): OptimizerState {
  switch (action.type) {
    case 'SET_DAYS': {
      const daysNum = parseInt(action.payload)
      if (action.payload === "" || (daysNum >= 0 && daysNum <= 365)) {
        return {
          ...state,
          days: action.payload,
          errors: { ...state.errors, days: undefined }
        }
      }
      return {
        ...state,
        errors: { ...state.errors, days: "Please enter a number between 0 and 365" }
      }
    }

    case 'SET_STRATEGY': {
      return { ...state, strategy: action.payload }
    }

    case 'SET_CUSTOM_DAYS': {
      return { ...state, customDaysOff: action.payload }
    }

    case 'ADD_CUSTOM_DAY': {
      const errors = validateCustomDay(action.payload)
      if (Object.keys(errors).length > 0) {
        return {
          ...state,
          errors: { ...state.errors, customDay: errors }
        }
      }
      return {
        ...state,
        customDaysOff: [...state.customDaysOff, action.payload],
        isAdding: false,
        newCustomDay: defaultCustomDay,
        errors: { ...state.errors, customDay: undefined }
      }
    }

    case 'REMOVE_CUSTOM_DAY': {
      const removedDay = state.customDaysOff[action.payload]
      return {
        ...state,
        customDaysOff: state.customDaysOff.filter((_, i) => i !== action.payload)
      }
    }

    case 'SET_IS_ADDING': {
      return {
        ...state,
        isAdding: action.payload,
        newCustomDay: action.payload ? defaultCustomDay : state.newCustomDay,
        errors: { ...state.errors, customDay: undefined }
      }
    }

    case 'UPDATE_NEW_CUSTOM_DAY': {
      const updatedDay = { ...state.newCustomDay, ...action.payload }
      const validationErrors = validateCustomDay(updatedDay)
      
      return {
        ...state,
        newCustomDay: updatedDay,
        errors: {
          ...state.errors,
          customDay: Object.keys(validationErrors).length > 0 ? validationErrors : undefined
        }
      }
    }

    case 'RESET_NEW_CUSTOM_DAY': {
      return {
        ...state,
        newCustomDay: defaultCustomDay,
        errors: { ...state.errors, customDay: undefined }
      }
    }

    case 'SET_ERROR': {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      }
    }

    case 'CLEAR_ERRORS': {
      return {
        ...state,
        errors: {}
      }
    }

    default: {
      return state
    }
  }
}

const OptimizerContext = createContext<{
  state: OptimizerState
  dispatch: React.Dispatch<OptimizerAction>
} | null>(null)

export function OptimizerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(optimizerReducer, initialState)

  return (
    <OptimizerContext.Provider value={{ state, dispatch }}>
      {children}
    </OptimizerContext.Provider>
  )
}

export function useOptimizer() {
  const context = useContext(OptimizerContext)
  if (!context) {
    throw new Error('useOptimizer must be used within an OptimizerProvider')
  }
  return context
} 