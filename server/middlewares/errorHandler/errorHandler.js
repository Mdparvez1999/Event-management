const AppError = require("../../utils/AppError");

/**
 * Error handler middleware.
 *
 * @param {Error} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object} - JSON response object.
 *
 * @description
 * This middleware function handles various types of errors and sends appropriate error responses.
 * It checks the type of error and generates custom error messages based on the error type.
 * If the error is operational, it sends a JSON response with the error status code and message.
 * If the error is not operational, it sends a generic error message with a status code of 500.
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000 && err.keyPattern.email) {
        err = handleDuplicateEmailError(err);
    } else if (err.code === 11000 && err.keyPattern.userName) {
        err = handleDuplicateUserNameError(err);
    } else if (err.name === "ValidationError") {
        err = handleValidationError(err);
    } else if (err.code === 11000 && err.keyPattern.ticketType) {
        err = handleDuplicateTicketError(err);
    } else if (err.name === "TokenExpiredError") {
        err = handleTokenExpiredError();
    } else if (err.name === "JsonWebTokenError") {
        err = handleJsonWebTokenError();
    }

    errorResult(res, err);
    console.log(err);
};

/**
 * Handle validation error.
 *
 * @param {Error} error - Validation error object.
 * @returns {AppError} - Custom error object.
 */
const handleValidationError = (error) => {
    let msg = error.details.map(err => err.message);
    return new AppError(400, msg);
};

/**
 * Handle duplicate email error.
 *
 * @param {Error} error - Duplicate email error object.
 * @returns {AppError} - Custom error object.
 */
const handleDuplicateEmailError = (error) => {
    let msg = `This ${error.keyValue.email} already exists`;
    return new AppError(409, msg);
};

/**
 * Handle duplicate username error.
 *
 * @param {Error} error - Duplicate username error object.
 * @returns {AppError} - Custom error object.
 */
const handleDuplicateUserNameError = (error) => {
    let msg = `Username ${error.keyValue.userName} is already taken, please use a different name`;
    return new AppError(409, msg);
};

/**
 * Handle duplicate ticket type error.
 *
 * @param {Error} error - Duplicate ticket type error object.
 * @returns {AppError} - Custom error object.
 */
const handleDuplicateTicketError = (error) => {
    let msg = `This ticket type ${error.keyValue.ticketType} exists, please use a different type`;
    return new AppError(409, msg);
};

/**
 * Handle token expired error.
 *
 * @returns {AppError} - Custom error object.
 */
const handleTokenExpiredError = () => {
    let msg = "Session expired, please login again";
    return new AppError(401, msg);
};

/**
 * Handle JSON web token error.
 *
 * @returns {AppError} - Custom error object.
 */
const handleJsonWebTokenError = () => {
    let msg = "You are not authorized to access this page";
    return new AppError(401, msg);
};

/**
 * Send error response.
 *
 * @param {Object} res - Express response object.
 * @param {AppError} error - Custom error object.
 * @returns {Object} - JSON response object.
 */
const errorResult = (res, error) => {
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else {
        return res.status(error.statusCode).json({
            status: error.status,
            message: "Something went wrong"
        });
    }
};

module.exports = errorHandler;
