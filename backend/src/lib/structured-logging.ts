/**
 * Structured Logging with Correlation IDs
 * 
 * Provides structured JSON logging with:
 * - Correlation IDs for request tracing
 * - Automatic redaction of sensitive data
 * - Log levels (debug, info, warn, error)
 * - Context preservation
 */

import { env } from "../config/env";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Sensitive data patterns to redact
 */
const SENSITIVE_PATTERNS = [
  /password["\s:=]+([^"\s,}]+)/gi,
  /token["\s:=]+([^"\s,}]+)/gi,
  /secret["\s:=]+([^"\s,}]+)/gi,
  /key["\s:=]+([^"\s,}]+)/gi,
  /authorization["\s:=]+([^"\s,}]+)/gi,
  /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
  /sk_[a-zA-Z0-9]{32,}/gi, // Stripe keys
  /pk_[a-zA-Z0-9]{32,}/gi, // Stripe keys
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Email
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi, // Credit card
  /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/gi, // Phone number
];

/**
 * Redact sensitive data from a string
 */
function redactSensitiveData(input: string): string {
  let redacted = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

/**
 * Redact sensitive data from an object
 */
function redactObject(obj: any): any {
  if (typeof obj === 'string') {
    return redactSensitiveData(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip known sensitive keys entirely
      if (['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'].includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactObject(value);
      }
    }
    return redacted;
  }
  
  return obj;
}

/**
 * Generate a correlation ID
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Structured logger class
 */
class StructuredLogger {
  private context: LogContext = {};

  constructor() {
    this.context = {};
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): StructuredLogger {
    const child = new StructuredLogger();
    child.setContext({ ...this.context, ...context });
    return child;
  }

  /**
   * Format log entry as JSON
   */
  private formatLogEntry(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: any, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
    };

    if (metadata) {
      entry.metadata = redactObject(metadata);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: redactSensitiveData(error.message),
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Write log entry
   */
  private write(entry: LogEntry): void {
    const logLevel = env.logLevel;
    const levels = ['debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(entry.level) >= levels.indexOf(logLevel)) {
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Debug log
   */
  debug(message: string, metadata?: any): void {
    const entry = this.formatLogEntry('debug', message, metadata);
    this.write(entry);
  }

  /**
   * Info log
   */
  info(message: string, metadata?: any): void {
    const entry = this.formatLogEntry('info', message, metadata);
    this.write(entry);
  }

  /**
   * Warning log
   */
  warn(message: string, metadata?: any): void {
    const entry = this.formatLogEntry('warn', message, metadata);
    this.write(entry);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, metadata?: any): void {
    const entry = this.formatLogEntry('error', message, metadata, error);
    this.write(entry);
  }
}

// Global logger instance
export const logger = new StructuredLogger();

/**
 * Express middleware to add correlation ID to request context
 */
export function correlationIdMiddleware(req: any, res: any, next: any) {
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  const requestId = req.id || (req.headers['x-request-id'] as string) || correlationId;
  req.correlationId = correlationId;
  req.id = requestId;
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('x-request-id', requestId);
  
  // Set logger context for this request
  const requestLogger = logger.child({ correlationId, requestId });
  req.logger = requestLogger;
  
  next();
}

/**
 * Logging utility functions
 */
export const log = {
  /**
   * Log authentication events
   */
  auth: {
    loginSuccess: (userId: string, method: string) => {
      logger.info('User logged in successfully', { userId, method });
    },
    loginFailed: (userId: string, reason: string) => {
      logger.warn('User login failed', { userId, reason });
    },
    logout: (userId: string) => {
      logger.info('User logged out', { userId });
    },
    mfaEnabled: (userId: string) => {
      logger.info('MFA enabled for user', { userId });
    },
    mfaDisabled: (userId: string) => {
      logger.warn('MFA disabled for user', { userId });
    },
  },

  /**
   * Log clinical events
   */
  clinical: {
    appointmentCreated: (appointmentId: string, patientId: string, clinicianId: string) => {
      logger.info('Appointment created', { appointmentId, patientId, clinicianId });
    },
    clinicalRecordUpdated: (recordId: string, clinicianId: string, appointmentId: string) => {
      logger.info('Clinical record updated', { recordId, clinicianId, appointmentId });
    },
    prescriptionCreated: (prescriptionId: string, clinicianId: string, patientId: string) => {
      logger.info('Prescription created', { prescriptionId, clinicianId, patientId });
    },
    triageEscalation: (patientId: string, flagType: string) => {
      logger.warn('Triage escalation triggered', { patientId, flagType });
    },
  },

  /**
   * Log API events
   */
  api: {
    requestReceived: (method: string, path: string, userId?: string) => {
      logger.debug('API request received', { method, path, userId });
    },
    requestCompleted: (method: string, path: string, statusCode: number, duration: number) => {
      logger.info('API request completed', { method, path, statusCode, duration });
    },
    requestFailed: (method: string, path: string, statusCode: number, error: Error) => {
      logger.error('API request failed', error, { method, path, statusCode });
    },
  },

  /**
   * Log payment events
   */
  payment: {
    paymentIntentCreated: (paymentIntentId: string, amount: number, currency: string) => {
      logger.info('Payment intent created', { paymentIntentId, amount, currency });
    },
    paymentSucceeded: (paymentIntentId: string, amount: number) => {
      logger.info('Payment succeeded', { paymentIntentId, amount });
    },
    paymentFailed: (paymentIntentId: string, reason: string) => {
      logger.warn('Payment failed', { paymentIntentId, reason });
    },
    refundProcessed: (paymentIntentId: string, amount: number) => {
      logger.info('Refund processed', { paymentIntentId, amount });
    },
  },

  /**
   * Log security events
   */
  security: {
    bruteForceDetected: (userId: string, ip: string) => {
      logger.warn('Brute force attack detected', { userId, ip });
    },
    suspiciousActivity: (userId: string, activity: string) => {
      logger.warn('Suspicious activity detected', { userId, activity });
    },
    accountLocked: (userId: string, reason: string) => {
      logger.warn('Account locked', { userId, reason });
    },
    passwordResetRequested: (userId: string) => {
      logger.info('Password reset requested', { userId });
    },
  },
};
