const AppError = require("../../utils/AppError");
const passport = require("passport");

/**
 * Middleware function for user authentication using JWT.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 *
 * @description
 * This middleware function authenticates users using JSON Web Tokens (JWT). It utilizes Passport.js
 * to authenticate requests with the 'jwt' strategy. If authentication is successful, it attaches the
 * authenticated user object to the request object and proceeds to the next middleware. If authentication
 * fails, it forwards any authentication errors to the error handling middleware.
 */
const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
        if (!user) {
            return next(info);
        }

        req.user = user;
        next();
    })(req, res, next);
};

/**
 * Middleware function for verifying admin authorization.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 *
 * @throws {AppError} - Throws an error if the user is not authorized.
 *
 * @description
 * This middleware function verifies whether the authenticated user is an admin. If the user is an admin,
 * it allows the request to proceed to the next middleware. If not, it throws an error indicating that the
 * user is not authorized to perform the requested action.
 */
const isAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            let msg = "You are not authorized";
            let err = new AppError(401, msg);
            return next(err);
        }

        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    auth,
    isAdmin
};
