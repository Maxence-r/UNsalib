import winston from "winston";
import path from "path";

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp as string} [${level}]: ${message as string}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    }),
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // Write all logs to all.log
        new winston.transports.File({
            filename: path.join("logs", "all.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write errors to errors.log
        new winston.transports.File({
            filename: path.join("logs", "errors.log"),
            level: "error",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join("logs", "exceptions.log"),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join("logs", "rejections.log"),
        }),
    ],
});

export { logger };
