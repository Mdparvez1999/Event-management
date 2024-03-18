/**
 * Express router for handling ticket purchase-related routes.
 * @module routes/purchaseRouter
 */

// Creating an instance of Express router
const purchaseRouter = require("express").Router();

// Importing necessary controllers and middleware
const { auth } = require("../../middlewares/authMiddleware/authMiddleware");
const { purchaseTicketController, getAllPurchasedTicketsController, purchasedTicketByIdController } = require("../../controllers/purchaseTicketController/purchaseTicketController");

/**
 * Route for purchasing a ticket.
 * @name POST/purchase/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} purchaseTicketController - Controller function for purchasing a ticket
 */
purchaseRouter.post("/purchase/:id", auth, purchaseTicketController);

/**
 * Route for retrieving all purchased tickets.
 * @name GET/ticketList
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} getAllPurchasedTicketsController - Controller function for retrieving all purchased tickets
 */
purchaseRouter.get("/ticketList", auth, getAllPurchasedTicketsController);

/**
 * Route for retrieving a purchased ticket by ID.
 * @name GET/purchasedticket/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} purchasedTicketByIdController - Controller function for retrieving a purchased ticket by ID
 */
purchaseRouter.get("/purchasedticket/:id", auth, purchasedTicketByIdController);

// Exporting the purchaseRouter for use in other modules
module.exports = purchaseRouter;
