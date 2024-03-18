/**
 * Express router for handling event-related routes.
 * @module routes/eventRouter
 */

// Creating an instance of Express router
const eventRouter = require("express").Router();

// Importing necessary controllers, middleware, and configuration
const { createEventsController, eventsListController, getEventsByIdController, updateEventByIdController, deleteEventByIdController, eventRatingsController, toggleEventController } = require("../../controllers/eventControllers/eventController");
const { auth, isAdmin } = require("../../middlewares/authMiddleware/authMiddleware");
const upload = require("../../config/multer/multerConfig");

/**
 * Route for creating an event.
 * @name POST/create
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} upload - Middleware function for file upload (using multer)
 * @param {function} createEventsController - Controller function for creating an event
 */
eventRouter.post("/create", auth, isAdmin, upload.single("image"), createEventsController);

/**
 * Route for retrieving a list of events.
 * @name GET/lists
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} eventsListController - Controller function for retrieving a list of events
 */
eventRouter.get("/lists", auth, eventsListController);

/**
 * Route for retrieving an event by ID.
 * @name GET/list/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} getEventsByIdController - Controller function for retrieving an event by ID
 */
eventRouter.get("/list/:id", auth, getEventsByIdController);

/**
 * Route for updating an event by ID.
 * @name PUT/list/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} updateEventByIdController - Controller function for updating an event by ID
 */
eventRouter.put("/list/:id", auth, isAdmin, updateEventByIdController);

/**
 * Route for deleting an event by ID.
 * @name DELETE/list/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} deleteEventByIdController - Controller function for deleting an event by ID
 */
eventRouter.delete("/list/:id", auth, isAdmin, deleteEventByIdController);

/**
 * Route for adding ratings to an event.
 * @name POST/ratings/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} eventRatingsController - Controller function for adding ratings to an event
 */
eventRouter.post("/ratings/:id", auth, eventRatingsController);

/**
 * Route for toggling an event.
 * @name PATCH/toggle/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} toggleEventController - Controller function for toggling an event
 */
eventRouter.patch("/toggle/:id", auth, isAdmin, toggleEventController);

// Exporting the eventRouter for use in other modules
module.exports = eventRouter;
