/**
 * Express router for handling category-related routes.
 * @module routes/categoryRouter
 */

// Creating an instance of Express router
const categoryRouter = require("express").Router();

// Importing necessary middleware and controllers
const { auth, isAdmin } = require("../../middlewares/authMiddleware/authMiddleware");
const {
    createCategoryController,
    getAllCategoryController,
    updateCategoryController,
    deleteCategoryController
} = require("../../controllers/categoryController/categoryController");

/**
 * Route for adding a new category.
 * @name POST/add
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} createCategoryController - Controller function for adding a new category
 */
categoryRouter.post("/add", auth, isAdmin, createCategoryController);

/**
 * Route for retrieving all categories.
 * @name GET/all
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} getAllCategoryController - Controller function for retrieving all categories
 */
categoryRouter.get("/all", auth, getAllCategoryController);

/**
 * Route for updating a category by ID.
 * @name PUT/update/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} updateCategoryController - Controller function for updating a category by ID
 */
categoryRouter.put("/update/:id", auth, isAdmin, updateCategoryController);

/**
 * Route for deleting a category by ID.
 * @name DELETE/delete/:id
 * @function
 * @param {string} path - The path for the route
 * @param {function} auth - Middleware function for authentication
 * @param {function} isAdmin - Middleware function for admin authorization
 * @param {function} deleteCategoryController - Controller function for deleting a category by ID
 */
categoryRouter.delete("/delete/:id", auth, isAdmin, deleteCategoryController);

// Exporting the categoryRouter for use in other modules
module.exports = categoryRouter;
