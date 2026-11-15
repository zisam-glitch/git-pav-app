import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { safeError } from "../lib/log-safety";
import { reportError } from "../lib/error-tracking";

/**
 * Error carrying an intended HTTP status. Thrown by helpers (e.g. missing
 * operator profile) so express-async-errors routes it here and the client
 * gets a meaningful status instead of a blanket 500.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * EH-3 / SV-3: Retrieve existing request ID from req.id or res header,
 * ensuring the identical ID is echoed in the response, logs, and error reports.
 */
function getOrSetRequestId(req: Request, res?: Response): string {
  if (req.id) return req.id;
  const fromHeader = req.headers?.["x-request-id"];
  const fromResHeader =
    typeof res?.getHeader === "function"
      ? (res.getHeader("x-request-id") as string | undefined)
      : undefined;
  const id =
    typeof fromHeader === "string" && fromHeader.trim().length > 0
      ? fromHeader.trim()
      : fromResHeader ?? crypto.randomUUID();
  req.id = id;
  if (
    typeof res?.setHeader === "function" &&
    typeof res?.getHeader === "function" &&
    !res.getHeader("x-request-id")
  ) {
    res.setHeader("x-request-id", id);
  }
  return id;
}

/** What the patient is told when something we depend on is down: short, plain, and it says to try again. */
export const DEPENDENCY_OUTAGE_MESSAGE = "A service we rely on isn't responding right now. Please try again in a moment.";

const OUTAGE_CODES = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "EPIPE"]);

/**
 * True when the error means a service we depend on could not be reached or is failing on its side (Stripe, Redis,
 * the database, or a network call that timed out), as opposed to a bug of ours or a bad request (D7).
 */
export function isDependencyOutage(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { type?: string; code?: unknown; name?: string; message?: string; cause?: unknown };
  if (e.type === "StripeConnectionError" || e.type === "StripeAPIError") return true;
  if (typeof e.code === "string" && (OUTAGE_CODES.has(e.code) || ["P1001", "P1002", "P1017"].includes(e.code))) return true;
  if (e.name === "MaxRetriesPerRequestError" || e.name === "PrismaClientInitializationError") return true;
  if (e.name === "TimeoutError" || e.name === "AbortError") return true;
  if (typeof e.message === "string" && /Connection is closed|Stream isn't writeable|^fetch failed$/.test(e.message)) {
    return true;
  }
  return !!e.cause && e.cause !== err && isDependencyOutage(e.cause);
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = getOrSetRequestId(req, res);
  const timestamp = new Date().toISOString();

  // Determine HTTP status and client message.
  // EH-2: Honour err.status/err.statusCode for 4xx, map multer errors to 400/413.
  let status = 500;
  let clientMessage: string | null = null;

  if (err instanceof HttpError) {
    status = err.status;
    clientMessage = err.message;
  } else if ((err as any).name === "MulterError") {
    const code = (err as any).code;
    if (code === "LIMIT_FILE_SIZE") {
      status = 413;
      clientMessage = "File too large";
    } else {
      status = 400;
      clientMessage = err.message || "Invalid file upload";
    }
  } else if (err.message && err.message.includes("image files are allowed")) {
    status = 400;
    clientMessage = err.message;
  } else if (isDependencyOutage(err)) {
    status = 503;
    clientMessage = DEPENDENCY_OUTAGE_MESSAGE;
    res.setHeader("Retry-After", "10");
  } else {
    const explicitStatus = (err as any).status ?? (err as any).statusCode;
    if (typeof explicitStatus === "number" && explicitStatus >= 400 && explicitStatus < 500) {
      status = explicitStatus;
      clientMessage = err.message || "Bad request";
    }
  }

  const logMeta = {
    ...safeError(err),
    path: req.path,
    method: req.method,
    bodyFields: req.body && typeof req.body === "object" ? Object.keys(req.body) : [],
    queryFields: Object.keys(req.query ?? {}),
  };

  // 4xx errors are client errors and must not be logged as server errors or reported to Sentry.
  if (status >= 500) {
    console.error(`[${requestId}] ${timestamp} ERROR:`, logMeta);
    // The route pattern (":id"), never the URL with its ids and query.
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.baseUrl || "unmatched";
    reportError(err, { requestId, method: req.method, route });
  } else {
    console.warn(`[${requestId}] ${timestamp} WARN:`, logMeta);
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isClientError = status < 500;
  // A dependency outage is still reported to us as a server error, but the patient gets the plain message.
  const showMessage = isClientError || status === 503;

  res.status(status).json({
    error: showMessage ? (clientMessage ?? err.message) : isDevelopment ? err.message : 'Internal server error',
    requestId,
    timestamp,
    ...(isDevelopment && status >= 500 && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  const requestId = getOrSetRequestId(req, res);
  const timestamp = new Date().toISOString();

  res.status(404).json({
    error: 'Not found',
    requestId,
    timestamp,
    path: req.path,
  });
}

export function standardResponse(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    const requestId = getOrSetRequestId(req, res);
    const timestamp = new Date().toISOString();
    
    // Add request ID and timestamp to successful responses if data is a plain object
    if (res.statusCode >= 200 && res.statusCode < 300 && typeof data === "object" && data !== null && !Array.isArray(data)) {
      return originalJson({
        ...data,
        requestId,
        timestamp,
      });
    }
    
    return originalJson(data);
  };
  
  next();
}
