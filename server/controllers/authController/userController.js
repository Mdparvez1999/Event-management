const userModel = require("../../models/userModel/userModel");
const Admin = require("../../models/adminModel/adminModel");
const { toggleSchema } = require("../../middlewares/validationMiddlewares/authValidation");
const AppError = require("../../utils/AppError");
const tryCatch = require("../../utils/tryCatch");

/**
 * userAccountController - controller for toggling active status of user account
 * 
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {Function} next - express next middleware function
 * @returns {Object} - JSON response object
 */
const userAccountController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = toggleSchema.validate(req.body);

    if (error) {
        return next(error);
    }

    // Extract toggle value from validated data
    let { toggle } = value;

    // Get user ID from authenticated user
    const userId = req.user.id;

    // Check if the request is unauthorized
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg)
        return next(err)
    };

    // Find the existing user by ID
    const existingUser = await userModel.findById(userId);

    // Check if the admin exists
    if (!existingUser) {
        let msg = "user not found";
        let err = new AppError(404, msg);
        return next(err);
    };

    // Check if the authenticated user is authorized to update the account
    if (existingUser._id.toString() !== userId) {
        let msg = "unauthorized to update this account";
        let err = new AppError(403, msg);
        return next(err);
    };

    // Update the user's active status
    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { active: toggle },
        { new: true }
    );

    // Check if the update was successful
    if (!updatedUser) {
        let msg = "failed, try again later";
        let err = new AppError(400, msg);
        return next(err);
    };

    // Send a success response
    return res.status(200).json({
        status: true,
        message: "account has been deactivated"
    });
});


/**
 * adminToggleAccount - Controller for toggling the active status of an admin account.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 */
const adminAccountController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = toggleSchema.validate(req.body);

    if (error) {
        return next(error);
    }

    // Extract toggle value from validated data
    let { toggle } = value;

    // Get admin ID from authenticated user
    const adminId = req.user.id;

    // Check if the request is unauthorized
    if (!adminId) {
        let msg = "Unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Find the existing admin by ID
    const existingAdmin = await Admin.findById(adminId);

    // Check if the admin exists
    if (!existingAdmin) {
        let msg = "User not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated admin is authorized to update the account
    if (existingAdmin._id.toString() !== adminId) {
        let msg = "Unauthorized to update this account";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Update the admin's active status
    const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { active: toggle },
        { new: true }
    );

    // Check if the update was successful
    if (!updatedAdmin) {
        let msg = "Failed to update, try again later";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Send a success response
    return res.status(200).json({
        status: true,
        message: "Account has been deactivated"
    });
});

module.exports = {
    userAccountController,
    adminAccountController
}

