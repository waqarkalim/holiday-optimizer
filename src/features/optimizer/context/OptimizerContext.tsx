import { createContext, ReactNode, useContext, useReducer } from 'react';
import { format, isValid, parse } from 'date-fns';
import { OptimizationStrategy, WeekdayNumber } from '@/types';
import { DEFAULT_WEEKEND_DAYS } from '@/constants';

interface Holiday {
  date: string;
  name: string;
  alternateNames?: string[];
}

interface OptimizerState {
  days: string;
  strategy: OptimizationStrategy;
  companyDaysOff: Array<{ date: string; name: string }>;
  preBookedDays: Array<{ date: string; name: string }>;
  holidays: Holiday[];
  selectedDates: Date[];
  selectedYear: number;
  weekendDays: WeekdayNumber[];
  remoteWorkDays: WeekdayNumber[];
  customStartDate?: string;
  customEndDate?: string;
  timeframePreset: TimeframePreset;
  errors: {
    days?: string;
    companyDay?: {
      name?: string;
      date?: string;
    };
    holiday?: {
      name?: string;
      date?: string;
    };
  };
}

type OptimizerAction =
  | { type: 'SET_DAYS'; payload: string }
  | { type: 'SET_STRATEGY'; payload: OptimizationStrategy }
  | { type: 'SET_COMPANY_DAYS'; payload: Array<{ date: string; name: string }> }
  | { type: 'ADD_COMPANY_DAY'; payload: { date: string; name: string } }
  | { type: 'REMOVE_COMPANY_DAY'; payload: string }
  | { type: 'SET_PRE_BOOKED_DAYS'; payload: Array<{ date: string; name: string }> }
  | { type: 'ADD_PRE_BOOKED_DAY'; payload: { date: string; name: string } }
  | { type: 'REMOVE_PRE_BOOKED_DAY'; payload: string }
  | { type: 'CLEAR_PRE_BOOKED_DAYS' }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_HOLIDAY'; payload: { date: string; name: string } }
  | { type: 'REMOVE_HOLIDAY'; payload: string }
  | { type: 'TOGGLE_DATE'; payload: Date }
  | { type: 'CLEAR_HOLIDAYS' }
  | { type: 'CLEAR_COMPANY_DAYS' }
  | { type: 'SET_DETECTED_HOLIDAYS'; payload: Array<{ date: string; name: string }> }
  | { type: 'SET_HOLIDAYS'; payload: Array<{ date: string; name: string }> }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  | { type: 'SET_WEEKEND_DAYS'; payload: WeekdayNumber[] }
  | { type: 'SET_REMOTE_WORK_DAYS'; payload: WeekdayNumber[] }
  | { type: 'APPLY_TIMEFRAME_PRESET'; payload: { preset: TimeframePreset; year?: number } }
  | { type: 'SET_CUSTOM_START_DATE'; payload: string | undefined }
  | { type: 'SET_CUSTOM_END_DATE'; payload: string | undefined }
  | { type: 'CLEAR_CUSTOM_DATE_RANGE' };

type TimeframePreset = 'calendar' | 'fiscal' | 'custom';

const DATE_FORMAT = 'yyyy-MM-dd';

const toISO = (date: Date) => format(date, DATE_FORMAT);

const getPresetRange = (preset: TimeframePreset, year: number): { start: string; end: string } => {
  switch (preset) {
    case 'fiscal': {
      // For fiscal year, we'll rely on the custom dates being set by the component
      // Default to July fiscal year as fallback
      const start = new Date(year, 6, 1);
      const end = new Date(year + 1, 5, 30);
      return { start: toISO(start), end: toISO(end) };
    }
    case 'calendar':
    default: {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { start: toISO(start), end: toISO(end) };
    }
  }
};

const currentYear = new Date().getFullYear();
const defaultRange = getPresetRange('calendar', currentYear);

const initialState: OptimizerState = {
  days: '',
  strategy: 'balanced',
  companyDaysOff: [],
  preBookedDays: [],
  holidays: [],
  selectedDates: [],
  selectedYear: currentYear,
  weekendDays: DEFAULT_WEEKEND_DAYS,
  remoteWorkDays: [],
  customStartDate: defaultRange.start,
  customEndDate: defaultRange.end,
  timeframePreset: 'calendar',
  errors: {},
};

function validateCompanyDay(day: { date: string; name: string }): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!day.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!day.date || !isValid(parse(day.date, 'yyyy-MM-dd', new Date()))) {
    errors.date = 'Valid date is required';
  }

  return errors;
}

function optimizerReducer(state: OptimizerState, action: OptimizerAction): OptimizerState {
  switch (action.type) {
    case 'SET_DAYS': {
      const daysNum = parseInt(action.payload);
      if (action.payload === '' || (daysNum >= 1 && daysNum <= 365)) {
        return {
          ...state,
          days: action.payload,
          errors: { ...state.errors, days: undefined },
        };
      }
      return {
        ...state,
        errors: { ...state.errors, days: 'Please enter a number between 1 and 365' },
      };
    }

    case 'SET_STRATEGY': {
      return { ...state, strategy: action.payload };
    }

    case 'SET_COMPANY_DAYS': {
      return { ...state, companyDaysOff: action.payload };
    }

    case 'ADD_COMPANY_DAY': {
      const errors = validateCompanyDay(action.payload);
      if (Object.keys(errors).length > 0) {
        return {
          ...state,
          errors: { ...state.errors, companyDay: errors },
        };
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
        errors: { ...state.errors, companyDay: undefined },
      };
    }

    case 'REMOVE_COMPANY_DAY': {
      return {
        ...state,
        companyDaysOff: state.companyDaysOff.filter(day => day.date !== action.payload),
      };
    }

    case 'SET_PRE_BOOKED_DAYS': {
      return { ...state, preBookedDays: action.payload };
    }

    case 'ADD_PRE_BOOKED_DAY': {
      const existingIndex = state.preBookedDays.findIndex(day => day.date === action.payload.date);
      const updatedPreBookedDays = [...state.preBookedDays];

      if (existingIndex !== -1) {
        updatedPreBookedDays[existingIndex] = action.payload;
      } else {
        updatedPreBookedDays.push(action.payload);
      }

      return {
        ...state,
        preBookedDays: updatedPreBookedDays,
      };
    }

    case 'REMOVE_PRE_BOOKED_DAY': {
      return {
        ...state,
        preBookedDays: state.preBookedDays.filter(day => day.date !== action.payload),
      };
    }

    case 'CLEAR_PRE_BOOKED_DAYS': {
      return {
        ...state,
        preBookedDays: [],
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
      };
    }

    case 'CLEAR_ERRORS': {
      return {
        ...state,
        errors: {},
      };
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
        errors: { ...state.errors, holiday: undefined },
      };
    }

    case 'REMOVE_HOLIDAY': {
      return {
        ...state,
        holidays: state.holidays.filter(day => day.date !== action.payload),
      };
    }

    case 'TOGGLE_DATE': {
      const dateStr = format(action.payload, 'yyyy-MM-dd');
      const isSelected = state.selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);

      if (isSelected) {
        return {
          ...state,
          selectedDates: state.selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr),
          holidays: state.holidays.filter(h => h.date !== dateStr),
        };
      } else {
        return {
          ...state,
          selectedDates: [...state.selectedDates, action.payload],
          holidays: [
            ...state.holidays,
            {
              date: dateStr,
              name: format(action.payload, 'MMMM d, yyyy'),
            },
          ],
        };
      }
    }

    case 'CLEAR_HOLIDAYS': {
      return {
        ...state,
        holidays: [],
        selectedDates: [],
      };
    }

    case 'CLEAR_COMPANY_DAYS': {
      return {
        ...state,
        companyDaysOff: [],
      };
    }

    case 'SET_DETECTED_HOLIDAYS': {
      // Simplify: Directly set holidays from the payload
      const updatedHolidays = action.payload.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        // Ensure alternateNames is initialized if needed, though likely not relevant for direct setting
        alternateNames: [],
      }));

      // Update selectedDates to match the new holidays
      const updatedSelectedDates = updatedHolidays.map(holiday =>
        parse(holiday.date, 'yyyy-MM-dd', new Date())
      );

      return {
        ...state,
        holidays: updatedHolidays,
        selectedDates: updatedSelectedDates,
        // Clear any potential holiday errors when setting new ones
        errors: { ...state.errors, holiday: undefined },
      };
    }

    case 'SET_HOLIDAYS': {
      return {
        ...state,
        holidays: action.payload,
      };
    }

    case 'SET_SELECTED_YEAR': {
      const { payload } = action;
      const isCustom = state.timeframePreset === 'custom';
      const nextRange = isCustom
        ? {
            start: state.customStartDate ?? getPresetRange('calendar', payload).start,
            end: state.customEndDate ?? getPresetRange('calendar', payload).end,
          }
        : getPresetRange(state.timeframePreset, payload);

      return {
        ...state,
        selectedYear: payload,
        customStartDate: nextRange.start,
        customEndDate: nextRange.end,
      };
    }

    case 'SET_WEEKEND_DAYS': {
      const validWeekendDays = Array.from(
        new Set(
          action.payload.filter(
            (day): day is WeekdayNumber => Number.isInteger(day) && day >= 0 && day <= 6
          )
        )
      );

      return {
        ...state,
        weekendDays: validWeekendDays.length > 0 ? validWeekendDays : DEFAULT_WEEKEND_DAYS,
      };
    }

    case 'SET_REMOTE_WORK_DAYS': {
      const normalized = Array.from(
        new Set(
          action.payload.filter(
            (day): day is WeekdayNumber => Number.isInteger(day) && day >= 0 && day <= 6
          )
        )
      );

      return {
        ...state,
        remoteWorkDays: normalized as WeekdayNumber[],
      };
    }

    case 'APPLY_TIMEFRAME_PRESET': {
      const { preset, year } = action.payload;
      if (preset === 'custom') {
        return {
          ...state,
          timeframePreset: 'custom',
          customStartDate: state.customStartDate ?? getPresetRange('calendar', state.selectedYear).start,
          customEndDate: state.customEndDate ?? getPresetRange('calendar', state.selectedYear).end,
        };
      }

      const targetYear = year ?? state.selectedYear;
      const { start, end } = getPresetRange(preset, targetYear);
      return {
        ...state,
        timeframePreset: preset,
        customStartDate: start,
        customEndDate: end,
      };
    }

    case 'SET_CUSTOM_START_DATE': {
      return {
        ...state,
        customStartDate: action.payload,
        // Don't automatically change preset type - let the component manage it
      };
    }

    case 'SET_CUSTOM_END_DATE': {
      return {
        ...state,
        customEndDate: action.payload,
        // Don't automatically change preset type - let the component manage it
      };
    }

    case 'CLEAR_CUSTOM_DATE_RANGE': {
      const { start, end } = getPresetRange('calendar', state.selectedYear);
      return {
        ...state,
        timeframePreset: 'calendar',
        customStartDate: start,
        customEndDate: end,
      };
    }

    default: {
      return state;
    }
  }
}

const OptimizerContext = createContext<{
  state: OptimizerState;
  dispatch: React.Dispatch<OptimizerAction>;
} | null>(null);

export function OptimizerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(optimizerReducer, initialState);

  return (
    <OptimizerContext.Provider value={{ state, dispatch }}>{children}</OptimizerContext.Provider>
  );
}

export function useOptimizer() {
  const context = useContext(OptimizerContext);
  if (!context) {
    throw new Error('useOptimizer must be used within an OptimizerProvider');
  }
  return context;
}
