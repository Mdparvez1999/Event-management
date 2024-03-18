/**
 * Express route for handling comment-related routes
 * @module routes/commentRoute
 */

// Creating an instance of Express router
const commentRoute = require("express").Router();

// Importing necessary controllers and middlewares
const { auth } = require("../../middlewares/authMiddleware/authMiddleware");
const { writeCommentsController, editCommentController, deleteCommentController, commentListController } = require("../../controllers/commentController/commentController");

/**
 * Route for writing a comment
 * @name POST/write/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} writeCommentsController - Controller function for writing a comment
 */
commentRoute.post("/write/:id", auth, writeCommentsController);

/**
 * Route for editing a comment
 * @name PUT/edit/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} editCommentController - Controller function for editing a comment
 */
commentRoute.put("/edit/:id", auth, editCommentController);

/**
 * Route for deleting a comment
 * @name DELETE/delete/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} deleteCommentController - Controller function for deleting a comment
 */
commentRoute.delete("/delete/:id", auth, deleteCommentController);

/**
 * Route for retrieving a list of comments
 * @name GET/list/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} commentListController - Controller function for retrieving a list of comments
 */
commentRoute.get("/list/:id", auth, commentListController);

// Exporting the commentRoute for use in other modules
module.exports = commentRoute;
