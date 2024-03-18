const JOI = require("joi");

/**
 * JOI schema for user signup.
 */
const signupSchema = JOI.object({
    userName: JOI.string().alphanum().min(6).max(30).trim().required(),
    email: JOI.string().email().trim().required(),
    gender: JOI.string().trim().required(),
    DOB: JOI.date().required(),
    password: JOI.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
});

/**
 * JOI schema for user login.
 */
const loginSchema = JOI.object({
    email: JOI.string().email().required(),
    password: JOI.string().required()
});

/**
 * JOI schema for toggle.
 */
const toggleSchema = JOI.object({
    toggle: JOI.boolean().required()
});

module.exports = {
    signupSchema,
    loginSchema,
    toggleSchema
};
