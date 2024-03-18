/**
 * Express router for handling ticket-related routes.
 * @module routes/ticketRoute
 */

// Creating an instance of Express router
const ticketRoute = require("express").Router();

// Importing necessary controllers and middleware
const { auth, isAdmin } = require("../../middlewares/authMiddleware/authMiddleware");
const { createTicketController, updateTicketByIdController, ticketListByEventController, singleTicketByIdController, deleteTicketsByIdController } = require("../../controllers/ticketController/ticketController");

/**
 * Route for creating a ticket.
 * @name POST/create/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} createTicketController - Controller function for creating a ticket
 */
ticketRoute.post("/create/:id", auth, isAdmin, createTicketController);

/**
 * Route for updating a ticket by ID.
 * @name PUT/update/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} updateTicketByIdController - Controller function for updating a ticket by ID
 */
ticketRoute.put("/update/:id", auth, isAdmin, updateTicketByIdController);

/**
 * Route for retrieving a list of tickets by event ID.
 * @name GET/list/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} ticketListByEventController - Controller function for retrieving a list of tickets by event ID
 */
ticketRoute.get("/list/:id", auth, ticketListByEventController);

/**
 * Route for retrieving a single ticket by ID.
 * @name GET/singleTicket/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} singleTicketByIdController - Controller function for retrieving a single ticket by ID
 */
ticketRoute.get("/singleTicket/:id", auth, singleTicketByIdController);

/**
 * Route for deleting tickets by ID.
 * @name DELETE/delete/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} deleteTicketsByIdController - Controller function for deleting tickets by ID
 */
ticketRoute.delete("/delete/:id", auth, isAdmin, deleteTicketsByIdController);

// Exporting the ticketRoute for use in other modules
module.exports = ticketRoute;
