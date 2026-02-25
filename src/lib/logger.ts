/* eslint-disable no-console */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

interface LogOptions {
    context?: string
    skipProduction?: boolean
}

/**
 * Safe logger that prevents sensitive data exposure in production
 * Only logs errors in production, all messages in development
 */
class Logger {
    private readonly isDevelopment = process.env.NODE_ENV === 'development'

    private shouldLog(skipProduction: boolean = false): boolean {
        return this.isDevelopment || !skipProduction
    }

    private formatMessage(level: LogLevel, message: string, context?: string): string {
        const timestamp = new Date().toISOString()
        const contextStr = context ? `[${context}]` : ''
        return `[${timestamp}] ${level.toUpperCase()} ${contextStr} ${message}`
    }

    log(message: string, data?: unknown, options?: LogOptions): void {
        if (this.shouldLog(options?.skipProduction)) {
            const formatted = this.formatMessage('log', message, options?.context)
            console.log(formatted, data || '')
        }
    }

    info(message: string, data?: unknown, options?: LogOptions): void {
        if (this.shouldLog(options?.skipProduction)) {
            const formatted = this.formatMessage('info', message, options?.context)
            console.info(formatted, data || '')
        }
    }

    warn(message: string, data?: unknown, options?: LogOptions): void {
        if (this.shouldLog(options?.skipProduction)) {
            const formatted = this.formatMessage('warn', message, options?.context)
            console.warn(formatted, data || '')
        }
    }

    /**
     * Error logs are always shown, even in production
     * Be careful not to log sensitive data
     */
    error(message: string, error?: unknown, options?: LogOptions): void {
        const formatted = this.formatMessage('error', message, options?.context)

        if (this.isDevelopment) {
            console.error(formatted, error)
        } else {
            // In production, only log the message without potentially sensitive error details
            console.error(formatted)

            // You could send this to a logging service like Sentry here
            // sendToErrorTracking(formatted, error)
        }
    }

    debug(message: string, data?: unknown, options?: LogOptions): void {
        if (this.isDevelopment) {
            const formatted = this.formatMessage('debug', message, options?.context)
            console.debug(formatted, data || '')
        }
    }
}

// Export singleton instance
export const logger = new Logger()

// Export type for consumers
export type { LogLevel, LogOptions }
