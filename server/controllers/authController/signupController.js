const { hashPassword } = require("../../helpers/authHelper");
const genToken = require("../../helpers/jwtHelper");
const User = require("../../models/userModel/userModel");
const Admin = require("../../models/adminModel/adminModel");
const { signupSchema } = require("../../middlewares/validationMiddlewares/authValidation");
const tryCatch = require("../../utils/tryCatch")

/**
 * userSignupController - controller for user sign up
 * @param {Object} req - express request object 
 * @param {Object} res - express response object 
 * @param {Function} next - express next middleware function 
 * @returns {Object}  - JSON response object 
 */
const userSignupController = tryCatch(async (req, res, next) => {
    // validating request body
    const { error, value } = signupSchema.validate(req.body)

    // handle validation error
    if (error) {
        return next(error);
    }

    // extract valaues from validated data
    const { userName, email, gender, DOB, password } = value;

    // hash password
    const hashedPassword = await hashPassword(password);

    // create new user
    const newUser = await User.create({
        userName,
        email,
        gender,
        DOB,
        password: hashedPassword
    });

    // generate token
    const token = genToken(newUser._id);

    // build admin data
    const data = buildUserDataResponse(newUser);

    // send a success response
    res.status(201).json({
        status: true,
        message: "account created successfully",
        token,
        data
    });
});

/**
 * adminSignupController - controller for user sign up
 * @param {Object} req - express request object 
 * @param {Object} res - express response object 
 * @param {Function} next - express next middleware function 
 * @returns {Object}  - JSON response object 
 */
const adminSignupController = tryCatch(async (req, res, next) => {
    // validaing user input
    const { error, value } = signupSchema.validate(req.body);

    if (error) {
        return next(error);
    }

    // extract values from validated data
    const { userName, email, gender, DOB, password } = value;

    // hash password
    const hashedPassword = await hashPassword(password);

    // create a new admin
    const newAdmin = await Admin.create({
        userName,
        email,
        gender,
        DOB,
        password: hashedPassword,
    });

    // generate token
    const token = genToken(newAdmin._id);

    // build admin data
    const data = buildUserDataResponse(newAdmin);

    // send a success response
    res.status(201).json({
        status: true,
        message: "account created successfully",
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
    userSignupController,
    adminSignupController
};
