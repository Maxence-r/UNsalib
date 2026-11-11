import winston from "winston";
import path from "path";

import { appConfig } from "../configs/app.config.js";

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

const infoOnlyFormat = winston.format((info) =>
    info.level === "info" ? info : false,
);

// Create logger instance
const logger = winston.createLogger({
    level: appConfig.log.level,
    format: logFormat,
    transports: [
        // Write informational logs only to infos.log
        new winston.transports.File({
            filename: path.join("logs", "infos.log"),
            format: winston.format.combine(logFormat, infoOnlyFormat()),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write warnings and errors to errors.log
        new winston.transports.File({
            filename: path.join("logs", "errors.log"),
            level: "warn",
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

const accessLogger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        new winston.transports.File({
            filename: path.join("logs", "access.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

if (appConfig.isDevMode) {
    // Write all logs to console in development mode
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        }),
    );
    accessLogger.add(
        new winston.transports.Console({
            format: consoleFormat,
        }),
    );
}

export { logger, accessLogger };