/**
 * Express router for handling payment-related routes.
 * @module routes/paymentRouter
 */

// Creating an instance of Express router
const paymentRouter = require("express").Router();

// Importing necessary controllers and middleware
const { auth } = require("../../middlewares/authMiddleware/authMiddleware");
const { checkoutController, getRazorPayKeyController, paymentVerification } = require("../../controllers/paymentController/paymentController");

/**
 * Route for processing checkout.
 * @name POST/checkout/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} checkoutController - Controller function for processing checkout
 */
paymentRouter.post("/checkout/:id", auth, checkoutController);

/**
 * Route for retrieving RazorPay API key.
 * @name GET/getKey
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} getRazorPayKeyController - Controller function for retrieving RazorPay API key
 */
paymentRouter.get("/getKey", auth, getRazorPayKeyController);

/**
 * Route for handling payment verification.
 * @name POST/verification
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} paymentVerification - Controller function for handling payment verification
 */
paymentRouter.post("/verification", auth, paymentVerification);

// Exporting the paymentRouter for use in other modules
module.exports = paymentRouter;
