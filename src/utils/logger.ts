import { format } from 'date-fns'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  component?: string
  action?: string
  data?: any
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LOG_COLORS = {
  debug: '#6b7280', // gray-500
  info: '#3b82f6',  // blue-500
  warn: '#f59e0b',  // amber-500
  error: '#ef4444', // red-500
}

// Set this to control the minimum log level
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

function formatLogMessage(level: LogLevel, message: string, options?: LogOptions): string {
  const timestamp = format(new Date(), 'HH:mm:ss.SSS')
  const component = options?.component ? `[${options.component}]` : ''
  const action = options?.action ? `(${options.action})` : ''
  return `${timestamp} ${level.toUpperCase()} ${component}${action}: ${message}`
}

function formatData(data: any): string {
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return String(data)
  }
}

export const logger = {
  debug(message: string, options?: LogOptions) {
    if (!shouldLog('debug')) return
    const formattedMessage = formatLogMessage('debug', message, options)
    if (options?.data) {
      console.debug(`%c${formattedMessage}`, `color: ${LOG_COLORS.debug}`, options.data)
    } else {
      console.debug(`%c${formattedMessage}`, `color: ${LOG_COLORS.debug}`)
    }
  },

  info(message: string, options?: LogOptions) {
    if (!shouldLog('info')) return
    const formattedMessage = formatLogMessage('info', message, options)
    if (options?.data) {
      console.info(`%c${formattedMessage}`, `color: ${LOG_COLORS.info}`, options.data)
    } else {
      console.info(`%c${formattedMessage}`, `color: ${LOG_COLORS.info}`)
    }
  },

  warn(message: string, options?: LogOptions) {
    if (!shouldLog('warn')) return
    const formattedMessage = formatLogMessage('warn', message, options)
    if (options?.data) {
      console.warn(`%c${formattedMessage}`, `color: ${LOG_COLORS.warn}`, options.data)
    } else {
      console.warn(`%c${formattedMessage}`, `color: ${LOG_COLORS.warn}`)
    }
  },

  error(message: string, options?: LogOptions) {
    if (!shouldLog('error')) return
    const formattedMessage = formatLogMessage('error', message, options)
    if (options?.data) {
      console.error(`%c${formattedMessage}`, `color: ${LOG_COLORS.error}`, options.data)
    } else {
      console.error(`%c${formattedMessage}`, `color: ${LOG_COLORS.error}`)
    }
  },

  group(title: string, collapsed: boolean = true) {
    collapsed ? console.groupCollapsed(title) : console.group(title)
  },

  groupEnd() {
    console.groupEnd()
  }
} 