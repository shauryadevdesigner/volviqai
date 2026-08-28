type LogLevel = "debug" | "info" | "warn" | "error";

const isDev =
  typeof process !== "undefined"
    ? process.env.NODE_ENV === "development"
    : false;

function shouldLog(level: LogLevel): boolean {
  if (level === "debug") return isDev;
  return true;
}

function formatPayload(
  context: string,
  message: string,
  data?: unknown,
): unknown[] {
  const prefix = `[Volviq:${context}]`;
  if (data !== undefined) {
    return [prefix, message, data];
  }
  return [prefix, message];
}

export const logger = {
  debug(context: string, message: string, data?: unknown) {
    if (!shouldLog("debug")) return;
    console.debug(...formatPayload(context, message, data));
  },
  info(context: string, message: string, data?: unknown) {
    if (!shouldLog("info")) return;
    console.info(...formatPayload(context, message, data));
  },
  warn(context: string, message: string, data?: unknown) {
    if (!shouldLog("warn")) return;
    console.warn(...formatPayload(context, message, data));
  },
  error(context: string, message: string, data?: unknown) {
    if (!shouldLog("error")) return;
    console.error(...formatPayload(context, message, data));
  },
};
