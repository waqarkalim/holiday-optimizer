import { createContext, ReactNode, useContext, useReducer } from 'react';
import { format, isAfter, isValid, parse } from 'date-fns';
import { CustomDayOff, OptimizationStrategy } from '@/types';

interface OptimizerState {
  days: string
  strategy: OptimizationStrategy
  customDaysOff: Array<{ date: string, name: string }>
  holidays: Array<{ date: string, name: string }>
  selectedDates: Date[]
  errors: {
    days?: string
    customDay?: {
      name?: string
      date?: string
    }
    holiday?: {
      name?: string
      date?: string
    }
  }
}

type OptimizerAction =
  | { type: 'SET_DAYS'; payload: string }
  | { type: 'SET_STRATEGY'; payload: OptimizationStrategy }
  | { type: 'SET_CUSTOM_DAYS'; payload: Array<{ date: string, name: string }> }
  | { type: 'ADD_CUSTOM_DAY'; payload: { date: string, name: string } }
  | { type: 'REMOVE_CUSTOM_DAY'; payload: number }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_HOLIDAY'; payload: { date: string, name: string } }
  | { type: 'REMOVE_HOLIDAY'; payload: number }
  | { type: 'TOGGLE_DATE'; payload: Date }
  | { type: 'CLEAR_HOLIDAYS' }
  | { type: 'CLEAR_CUSTOM_DAYS' }

const initialState: OptimizerState = {
  days: "",
  strategy: "balanced",
  customDaysOff: [],
  holidays: [],
  selectedDates: [],
  errors: {}
}

function validateCustomDay(day: { date: string, name: string }): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!day.name?.trim()) {
    errors.name = "Name is required"
  }

  if (!day.date || !isValid(parse(day.date, 'yyyy-MM-dd', new Date()))) {
    errors.date = "Valid date is required"
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
        errors: { ...state.errors, customDay: undefined }
      }
    }

    case 'REMOVE_CUSTOM_DAY': {
      return {
        ...state,
        customDaysOff: state.customDaysOff.filter((_, i) => i !== action.payload)
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

    case 'ADD_HOLIDAY': {
      return {
        ...state,
        holidays: [...state.holidays, action.payload],
        errors: { ...state.errors, holiday: undefined }
      }
    }

    case 'REMOVE_HOLIDAY': {
      return {
        ...state,
        holidays: state.holidays.filter((_, i) => i !== action.payload)
      }
    }

    case 'TOGGLE_DATE': {
      const dateStr = format(action.payload, 'yyyy-MM-dd');
      const isSelected = state.selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      
      if (isSelected) {
        return {
          ...state,
          selectedDates: state.selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr),
          holidays: state.holidays.filter(h => h.date !== dateStr)
        };
      } else {
        return {
          ...state,
          selectedDates: [...state.selectedDates, action.payload],
          holidays: [...state.holidays, { date: dateStr, name: format(action.payload, 'MMMM d, yyyy') }]
        };
      }
    }

    case 'CLEAR_HOLIDAYS': {
      return {
        ...state,
        holidays: [],
        selectedDates: []
      };
    }

    case 'CLEAR_CUSTOM_DAYS': {
      return {
        ...state,
        customDaysOff: []
      };
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