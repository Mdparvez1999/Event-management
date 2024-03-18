/**
 * Express router for handling user-related routes.
 * @module routes/userRoute
 */

// Creating an instance of Express router
const userRoute = require("express").Router();

// Importing necessary controllers and middleware
const { userSignupController } = require("../../controllers/authController/signupController");
const { userLoginController } = require("../../controllers/authController/loginController");
const { auth } = require("../../middlewares/authMiddleware/authMiddleware");
const { userAccountController } = require("../../controllers/authController/userController");

/**
 * Route for user signup.
 * @name POST/signup
 * @function
 * @param {string} path - The path for the route
 * @param {function} userSignupController - controller function for sign up 
 */
userRoute.post("/signup", userSignupController);

/**
 * Route for user login.
 * @name POST/login
 * @function
 * @param {string} path - The path for the route
 * @param {function} userLoginController - controller function for login 
 */
userRoute.post("/login", userLoginController);

/**
 * Route to toggle user account settings with authentication middleware.
 * @name PATCH/toggle
 * @functionF
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} userAccountController - Controller function for toggling user account settings
 */
userRoute.patch("/toggle", auth, userAccountController);

// Exporting the userRoute for use in other modules
module.exports = userRoute;
