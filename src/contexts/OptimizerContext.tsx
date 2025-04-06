import { createContext, ReactNode, useContext, useReducer } from 'react';
import { format, isValid, parse } from 'date-fns';
import { OptimizationStrategy } from '@/types';

interface Holiday {
  date: string;
  name: string;
  alternateNames?: string[];
}

interface OptimizerState {
  days: string
  strategy: OptimizationStrategy
  companyDaysOff: Array<{ date: string, name: string }>
  holidays: Holiday[]
  selectedDates: Date[]
  selectedYear: number
  errors: {
    days?: string
    companyDay?: {
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
  | { type: 'SET_COMPANY_DAYS'; payload: Array<{ date: string, name: string }> }
  | { type: 'ADD_COMPANY_DAY'; payload: { date: string, name: string } }
  | { type: 'REMOVE_COMPANY_DAY'; payload: string }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_HOLIDAY'; payload: { date: string, name: string } }
  | { type: 'REMOVE_HOLIDAY'; payload: string }
  | { type: 'TOGGLE_DATE'; payload: Date }
  | { type: 'CLEAR_HOLIDAYS' }
  | { type: 'CLEAR_COMPANY_DAYS' }
  | { type: 'SET_DETECTED_HOLIDAYS'; payload: Array<{ date: string, name: string }> }
  | { type: 'SET_HOLIDAYS'; payload: Array<{ date: string, name: string }> }
  | { type: 'SET_SELECTED_YEAR'; payload: number }

const initialState: OptimizerState = {
  days: "",
  strategy: "balanced",
  companyDaysOff: [],
  holidays: [],
  selectedDates: [],
  selectedYear: new Date().getFullYear(),
  errors: {}
}

function validateCompanyDay(day: { date: string, name: string }): Record<string, string> {
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
      if (action.payload === "" || (daysNum >= 1 && daysNum <= 365)) {
        return {
          ...state,
          days: action.payload,
          errors: { ...state.errors, days: undefined }
        }
      }
      return {
        ...state,
        errors: { ...state.errors, days: "Please enter a number between 1 and 365" }
      }
    }

    case 'SET_STRATEGY': {
      return { ...state, strategy: action.payload }
    }

    case 'SET_COMPANY_DAYS': {
      return { ...state, companyDaysOff: action.payload }
    }

    case 'ADD_COMPANY_DAY': {
      const errors = validateCompanyDay(action.payload)
      if (Object.keys(errors).length > 0) {
        return {
          ...state,
          errors: { ...state.errors, companyDay: errors }
        }
      }

      const existingIndex = state.companyDaysOff.findIndex(day => day.date === action.payload.date);
      const updatedCompanyDays = [...state.companyDaysOff];

      if (existingIndex !== -1) {
        // Update existing company day
        updatedCompanyDays[existingIndex] = action.payload;
      } else {
        // Add new company day
        updatedCompanyDays.push(action.payload);
      }

      return {
        ...state,
        companyDaysOff: updatedCompanyDays,
        errors: { ...state.errors, companyDay: undefined }
      }
    }

    case 'REMOVE_COMPANY_DAY': {
      return {
        ...state,
        companyDaysOff: state.companyDaysOff.filter(day => day.date !== action.payload)
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
      const existingIndex = state.holidays.findIndex(day => day.date === action.payload.date);
      const updatedHolidays = [...state.holidays];

      if (existingIndex !== -1) {
        // Update existing holiday
        updatedHolidays[existingIndex] = action.payload;
      } else {
        // Add new holiday
        updatedHolidays.push(action.payload);
      }

      return {
        ...state,
        holidays: updatedHolidays,
        errors: { ...state.errors, holiday: undefined }
      }
    }

    case 'REMOVE_HOLIDAY': {
      return {
        ...state,
        holidays: state.holidays.filter(day => day.date !== action.payload)
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
          holidays: [...state.holidays, { 
            date: dateStr, 
            name: format(action.payload, 'MMMM d, yyyy')
          }]
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

    case 'CLEAR_COMPANY_DAYS': {
      return {
        ...state,
        companyDaysOff: []
      };
    }

    case 'SET_DETECTED_HOLIDAYS': {
      // Simplify: Directly set holidays from the payload
      const updatedHolidays = action.payload.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        // Ensure alternateNames is initialized if needed, though likely not relevant for direct setting
        alternateNames: [] 
      }));

      // Update selectedDates to match the new holidays
      const updatedSelectedDates = updatedHolidays.map(
        holiday => parse(holiday.date, 'yyyy-MM-dd', new Date())
      );

      return {
        ...state,
        holidays: updatedHolidays,
        selectedDates: updatedSelectedDates,
        // Clear any potential holiday errors when setting new ones
        errors: { ...state.errors, holiday: undefined }
      };
    }

    case 'SET_HOLIDAYS': {
      return {
        ...state,
        holidays: action.payload
      };
    }

    case 'SET_SELECTED_YEAR': {
      return {
        ...initialState,
        selectedYear: action.payload
      };
    }

    default: {
      return state;
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