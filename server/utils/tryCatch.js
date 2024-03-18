/**
 * Middleware function to handle asynchronous controller functions and catch any errors.
 * @function tryCatch
 * @param {Function} controller - The controller function to be executed.
 * @returns {Function} - Returns an asynchronous middleware function.
 */
const tryCatch = (controller) => {
    // Asynchronous middleware function to execute the provided controller function.
    return async (req, res, next) => {
        try {
            // Execute the provided controller function
            await controller(req, res, next);
        } catch (error) {
            // Pass it to the error handling middleware
            // console.log(error);
            return next(error);
        }
    };
};

// Exporting the tryCatch middleware for use in other modules
module.exports = tryCatch;
