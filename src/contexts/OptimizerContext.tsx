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
  logger.debug('Validating custom day', {
    component: 'OptimizerContext',
    action: 'validateCustomDay',
    data: { day }
  })

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

  if (Object.keys(errors).length > 0) {
    logger.warn('Custom day validation failed', {
      component: 'OptimizerContext',
      action: 'validateCustomDay',
      data: { day, errors }
    })
  } else {
    logger.debug('Custom day validation passed', {
      component: 'OptimizerContext',
      action: 'validateCustomDay',
      data: { day }
    })
  }

  return errors
}

function optimizerReducer(state: OptimizerState, action: OptimizerAction): OptimizerState {
  logger.debug('Reducer called', {
    component: 'OptimizerContext',
    action: 'reducer',
    data: { 
      actionType: action.type,
      ...(('payload' in action) ? { payload: action.payload } : {})
    }
  })

  switch (action.type) {
    case 'SET_DAYS': {
      const daysNum = parseInt(action.payload)
      if (action.payload === "" || (daysNum >= 0 && daysNum <= 365)) {
        logger.info('Days updated successfully', {
          component: 'OptimizerContext',
          action: 'SET_DAYS',
          data: { newValue: action.payload, oldValue: state.days }
        })
        return {
          ...state,
          days: action.payload,
          errors: { ...state.errors, days: undefined }
        }
      }
      logger.warn('Invalid days value', {
        component: 'OptimizerContext',
        action: 'SET_DAYS',
        data: { invalidValue: action.payload }
      })
      return {
        ...state,
        errors: { ...state.errors, days: "Please enter a number between 0 and 365" }
      }
    }

    case 'SET_STRATEGY': {
      logger.info('Strategy updated', {
        component: 'OptimizerContext',
        action: 'SET_STRATEGY',
        data: { newStrategy: action.payload, oldStrategy: state.strategy }
      })
      return { ...state, strategy: action.payload }
    }

    case 'SET_CUSTOM_DAYS': {
      logger.info('Custom days bulk update', {
        component: 'OptimizerContext',
        action: 'SET_CUSTOM_DAYS',
        data: { newDays: action.payload, oldDays: state.customDaysOff }
      })
      return { ...state, customDaysOff: action.payload }
    }

    case 'ADD_CUSTOM_DAY': {
      const errors = validateCustomDay(action.payload)
      if (Object.keys(errors).length > 0) {
        logger.warn('Failed to add custom day - validation errors', {
          component: 'OptimizerContext',
          action: 'ADD_CUSTOM_DAY',
          data: { day: action.payload, errors }
        })
        return {
          ...state,
          errors: { ...state.errors, customDay: errors }
        }
      }
      logger.info('Custom day added successfully', {
        component: 'OptimizerContext',
        action: 'ADD_CUSTOM_DAY',
        data: { newDay: action.payload }
      })
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
      logger.info('Custom day removed', {
        component: 'OptimizerContext',
        action: 'REMOVE_CUSTOM_DAY',
        data: { removedDay, index: action.payload }
      })
      return {
        ...state,
        customDaysOff: state.customDaysOff.filter((_, i) => i !== action.payload)
      }
    }

    case 'SET_IS_ADDING': {
      logger.debug('Adding mode toggled', {
        component: 'OptimizerContext',
        action: 'SET_IS_ADDING',
        data: { newValue: action.payload, oldValue: state.isAdding }
      })
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
      
      logger.debug('New custom day updated', {
        component: 'OptimizerContext',
        action: 'UPDATE_NEW_CUSTOM_DAY',
        data: { 
          updates: action.payload,
          previousState: state.newCustomDay,
          newState: updatedDay,
          validationErrors
        }
      })

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
      logger.debug('New custom day reset', {
        component: 'OptimizerContext',
        action: 'RESET_NEW_CUSTOM_DAY',
        data: { previousState: state.newCustomDay }
      })
      return {
        ...state,
        newCustomDay: defaultCustomDay,
        errors: { ...state.errors, customDay: undefined }
      }
    }

    case 'SET_ERROR': {
      logger.warn('Error set manually', {
        component: 'OptimizerContext',
        action: 'SET_ERROR',
        data: { field: action.payload.field, message: action.payload.message }
      })
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      }
    }

    case 'CLEAR_ERRORS': {
      logger.debug('Errors cleared', {
        component: 'OptimizerContext',
        action: 'CLEAR_ERRORS',
        data: { previousErrors: state.errors }
      })
      return {
        ...state,
        errors: {}
      }
    }

    default: {
      logger.error('Unknown action type', {
        component: 'OptimizerContext',
        action: 'reducer',
        data: { action }
      })
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

  logger.debug('OptimizerProvider rendered', {
    component: 'OptimizerContext',
    data: { 
      currentState: {
        days: state.days,
        strategy: state.strategy,
        customDaysCount: state.customDaysOff.length,
        isAdding: state.isAdding,
        hasErrors: Object.keys(state.errors).length > 0
      }
    }
  })

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