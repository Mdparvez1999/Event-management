/**
 * Express route for handling admin related routes
 * @module routes/userRoute
 */

// Creating an instance of Express router
const adminRoute = require("express").Router();

// Importing necessary controllers and middlewares
const { adminSignupController } = require("../../controllers/authController/signupController");
const { adminLoginController } = require("../../controllers/authController/loginController");
const { auth } = require("../../middlewares/authMiddleware/authMiddleware");
const { adminAccountController } = require("../../controllers/authController/userController");

/**
 * Route for admin sign up
 * @name Post/adminsignup
 * @function
 * @param {string} path - the path for the route
 * @param {Function} adminSignupController - controller function for sign up 
 */
adminRoute.post("/adminsignup", adminSignupController);

/**
 * Route for admin login
 * @name Post/adminlogin
 * @function
 * @param {String} path - path for the route
 * @param {Function} adminLoginController - controller function for log in
 */
adminRoute.post("/adminlogin", adminLoginController);

/**
 * Route to toggle user account settings with authentication middleware.
 * @name Patch/toggle
 * @function
 * @param {String} path - path for the route
 * @param {Function} auth - Middleware function for authentication
 * @param {Function} adminAccountController - Controller function for toggling user account settings
 */
adminRoute.patch("/toggle", auth, adminAccountController);

// Exporting the userRoute for use in other modules
module.exports = adminRoute;
