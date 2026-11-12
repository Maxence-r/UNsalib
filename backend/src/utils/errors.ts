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
    details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

type NonPromise<T> = T extends PromiseLike<unknown> ? never : T;

function ensureNotNull<Args extends unknown[], Result>(
    errorMessage: string,
    fn: (...args: Args) => NonPromise<Result>,
    ...args: Args
): NonNullable<Result> {
    const result = fn(...args);

    if (result === null || result === undefined) {
        throw new ServiceError(errorMessage);
    }

    return result;
}

async function ensureNotNullAsync<Args extends unknown[], Result>(
    errorMessage: string,
    fn: (...args: Args) => PromiseLike<Result>,
    ...args: Args
): Promise<NonNullable<Result>> {
    const result = await fn(...args);

    if (result === null || result === undefined) {
        throw new ServiceError(errorMessage);
    }

    return result;
}

export { ServiceError, ApiError, ensureNotNull, ensureNotNullAsync };
