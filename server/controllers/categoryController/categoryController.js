const { default: mongoose } = require("mongoose");
const categorySchema = require("../../middlewares/validationMiddlewares/categoryValidation");
const categoryModel = require("../../models/categoryModel/categoryModel");
const AppError = require("../../utils/AppError");
const tryCatch = require("../../utils/tryCatch");

/**
 * Adds a new category.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - newCategory {Object} - Details of the newly added category (if any).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function adds a new category. It expects the category details in the request body and
 * utilizes the Express request, response, and next middleware functions to manage the addition process.
 * The function returns a JSON response object indicating the status of the operation, along with an
 * optional message and details of the newly added category.
 */
const createCategoryController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = categorySchema.validate(req.body);

    // Handle validation error
    if (error) {
        return next(error);
    }

    // Destructure category details from request body
    const { name } = value;

    // Get ID from authenticated admin
    const adminId = req.user._id;

    // Check if the request is unauthorized
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Create a new category
    const newCategory = await categoryModel.create({
        admin: adminId,
        name
    });

    // Send success response
    return res.status(201).json({
        status: true,
        message: "category added successfully",
        newCategory
    });
});


/**
 * Retrieves all categories.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - allCategories {Array} - Array containing details of all categories (if any).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function retrieves all categories. It utilizes the Express request, response, and
 * next middleware functions to manage the retrieval process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and an array containing details
 * of all categories.
 */
const getAllCategoryController = tryCatch(async (req, res, next) => {
    // Retrieve all categories
    const allCategories = await categoryModel.find();

    // Check if categories are found
    if (!allCategories) {
        let msg = "categories not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Send success response
    return res.status(200).json({
        status: true,
        message: "successful",
        allCategories
    });
});


/**
 * Updates category details.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - category {Object} - Details of the updated category (if any).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function updates category details based on the provided category ID. It expects the
 * updated category details in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the update process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and details of the updated category.
 */
const updateCategoryController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = categorySchema.validate(req.body);

    // Handle validation error
    if (error) {
        return next(error);
    }

    // Destructure category details from request body
    const { name } = value;

    // Get category ID from request parameters
    const categoryId = req.params.id;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        let msg = "invalid category id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing category based on category ID
    const existingCategory = await categoryModel.findById(categoryId);

    // Handle category not found
    if (!existingCategory) {
        let msg = "category not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Get ID from authenticated admin
    const adminId = req.user._id;

    // Check if the request is unauthorized
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Check if the authenticated user is authorized to update this category
    if (existingCategory.admin.toString() !== adminId.toString()) {
        let msg = "unauthorized to update this category";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Update category details
    const updatedCategory = await categoryModel.findByIdAndUpdate(categoryId,
        {
            admin: adminId,
            name
        }, { new: true }
    );

    // Handle category not found or could not be updated
    if (!updatedCategory) {
        let msg = "category not found or could not be updated";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Send success response
    return res.status(200).json({
        status: true,
        message: "category details updated successfully",
        category: {
            id: updatedCategory._id,
            name: updatedCategory.name
        }
    });
});


/**
 * Deletes a category.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function deletes a category based on the provided category ID. It utilizes the Express
 * request, response, and next middleware functions to manage the deletion process. The function returns
 * a JSON response object indicating the status of the operation, along with an optional message.
 */
const deleteCategoryController = tryCatch(async (req, res, next) => {
    // Get category ID from request parameters
    const categoryId = req.params.id;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        let msg = "invalid category id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing category based on category ID
    const existingCategory = await categoryModel.findById(categoryId);

    // Handle category not found
    if (!existingCategory) {
        let msg = "category not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Get ID from authenticated admin
    const adminId = req.user._id;

    // Check if the request is unauthorized
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Check if the authenticated user is authorized to delete this category
    if (existingCategory.admin.toString() !== adminId.toString()) {
        let msg = "unauthorized to delete this category";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Delete the category
    const deletedCategory = await categoryModel.deleteOne({ _id: categoryId });

    // Handle category not found or could not be deleted
    if (!deletedCategory) {
        let msg = "category not found or could not be deleted";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Send success response
    return res.status(200).json({
        status: true,
        message: "category deleted successfully",
    });
});



module.exports = {
    createCategoryController,
    getAllCategoryController,
    updateCategoryController,
    deleteCategoryController
}