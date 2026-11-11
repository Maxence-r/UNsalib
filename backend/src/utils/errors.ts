class ServiceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ServiceError";
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ServiceError, ApiError };