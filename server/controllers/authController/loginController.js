const { comparePassword } = require("../../helpers/authHelper");
const genToken = require("../../helpers/jwtHelper");
const User = require("../../models/userModel/userModel");
const Admin = require("../../models/adminModel/adminModel")
const { loginSchema } = require("../../middlewares/validationMiddlewares/authValidation");
const AppError = require("../../utils/AppError");
const tryCatch = require("../../utils/tryCatch");

/**
 * userLoginController - controller for user login
 * @param {Object} req - express request object 
 * @param {Object} res - express response object 
 * @param {Function} next - express next middleware function 
 * @returns {Object}  - JSON response object 
 */
const userLoginController = tryCatch(async (req, res, next) => {
    // validate request body
    const { error, value } = loginSchema.validate(req.body);

    // handle validation error
    if (error) {
        return next(error)
    }

    // extract values from validated data
    const { email, password } = value;

    // find existing user
    let existingUser = await User.findOne({ email });

    // handle user not found
    if (!existingUser) {
        let msg = `user not found with this ${email} mail`;
        let err = new AppError(404, msg);
        return next(err)
    };

    // compare password
    const passwordMatch = await comparePassword(password, existingUser.password);

    // handle incorrect password
    if (!passwordMatch) {
        let msg = `incorrect password`;
        let err = new AppError(401, msg);
        return next(err);
    };

    // variable to update active status of user
    let active = true;

    // update active status of the user
    if (!existingUser.active) {
        // find user
        existingUser = await User.findByIdAndUpdate(
            existingUser._id,
            { active: active },
            { new: true }
        );

        // build user data
        const data = buildUserDataResponse(existingUser);

        // generate a token
        const token = genToken(existingUser._id);

        // send success response
        return res.status(200).json({
            status: true,
            message: 'account activated successfully',
            token,
            data
        })
    }

    // generate a token
    const token = genToken(existingUser._id);

    // build user data
    const data = buildUserDataResponse(existingUser);

    // send success response
    res.status(200).json({
        status: true,
        message: "login successful",
        token,
        data
    });
});

/**
 * adminLoginController - controller for admin login
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {Function} next - express next middleware function
 * @param {Object} - JSON response object
 */

const adminLoginController = tryCatch(async (req, res, next) => {
    // validate req body
    const { error, value } = loginSchema.validate(req.body);

    // handle validation erros
    if (error) {
        return next(error)
    }

    // extract valaues from validated data
    const { email, password } = value;

    // find existing user
    let existingAdmin = await Admin.findOne({ email });

    // handle user not found
    if (!existingAdmin) {
        let msg = `admin not found with this ${email} mail`;
        let err = new AppError(404, msg);
        return next(err)
    };

    // compare password
    const passwordMatch = await comparePassword(password, existingAdmin.password);

    // handle incorrect password
    if (!passwordMatch) {
        let msg = `incorrect password`;
        let err = new AppError(401, msg);
        return next(err);
    };

    // variable to update active status of user
    let active = true;

    // update active status of the admin
    if (!existingAdmin.active) {
        // find admin 
        existingAdmin = await Admin.findByIdAndUpdate(
            existingAdmin._id,
            { active: active },
            { new: true }
        );

        // build user data
        const data = buildUserDataResponse(existingAdmin);

        // generate a token
        const token = genToken(existingAdmin._id);

        // send success response
        return res.status(200).json({
            status: true,
            message: 'account activated successfully',
            token,
            data
        })
    }

    // generate token
    const token = genToken(existingAdmin._id);

    // build user data
    const data = buildUserDataResponse(existingAdmin);

    // send success response
    res.status(200).json({
        status: true,
        message: "login successful",
        token,
        data
    });
});

/**
 * buildUserDataResponse - Build user data for the response.
 *
 * @param {Object} data - User object from the database.
 * @returns {Object} - User data for the response.
 */
function buildUserDataResponse(data) {
    return {
        id: data._id,
        name: data.userName,
        email: data.email,
        gender: data.gender,
        DOB: data.DOB,
        role: data.role,
        active: data.active
    }
};

module.exports = {
    userLoginController, adminLoginController
}