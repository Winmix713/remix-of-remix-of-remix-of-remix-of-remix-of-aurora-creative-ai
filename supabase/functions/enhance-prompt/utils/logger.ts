import type { LogEntry, LogLevel } from "../types/index.ts";

const SERVICE_NAME = "enhance-prompt-function";
const ENVIRONMENT = Deno.env.get("DENO_ENV") || "development";

function log(entry: LogEntry): void {
  const finalEntry = {
    service: SERVICE_NAME,
    environment: ENVIRONMENT,
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };
  const output = JSON.stringify(finalEntry);

  switch (finalEntry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "debug", message, metadata }),

  info: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "info", message, metadata }),

  warn: (message: string, metadata?: Record<string, unknown>) =>
    log({ level: "warn", message, metadata }),

  error: (message: string, error?: Error | null, metadata?: Record<string, unknown>) =>
    log({
      level: "error",
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      metadata,
    }),

  request: (req: Request, status: number, duration: number, requestId: string) =>
    log({
      level: "info",
      message: `Request completed: ${req.method} ${new URL(req.url).pathname}`,
      requestId,
      duration,
      status,
      ip: req.headers.get("x-forwarded-for") || undefined,
      metadata: {
        method: req.method,
        path: new URL(req.url).pathname,
        userAgent: req.headers.get("user-agent"),
      },
    }),
};
