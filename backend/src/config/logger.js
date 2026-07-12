import pino from "pino";

// Pretty-printed, colorized logs in dev; fast raw JSON logs in production
// (JSON is what log aggregators like Datadog/Better Stack/CloudWatch expect —
// pretty-printing in prod would just slow down every request for no benefit).
const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;