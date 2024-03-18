/**
 * Custom error class for handling application-specific errors.
 * @class
 * @name AppError
 * @extends Error
 */
class AppError extends Error {
    /**
     * Creates an instance of AppError.
     * @constructor
     * @param {number} statusCode - The HTTP status code associated with the error.
     * @param {string} message - The error message.
     * @param {boolean} [status=false] - The status indicating the error condition. Default is `false`.
     * @param {boolean} [isOperational=true] - Indicates if the error is operational. Default is `true`.
     */
    constructor(statusCode, message, status = false, isOperational = true) {
        super(message);

        // HTTP status code associated with the error.
        this.statusCode = statusCode;

        // Error message.
        this.message = message;

        // Status indicating the error condition.
        this.status = status;

        // Indicates if the error is operational.
        this.isOperational = isOperational;
    }
}

// Exporting the AppError class for use in other modules
module.exports = AppError;
