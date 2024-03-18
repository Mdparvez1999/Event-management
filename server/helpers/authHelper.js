const bcrypt = require("bcrypt");
const tryCatch = require("../utils/tryCatch");

/**
 * Hashes the provided password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 */
const hashPassword = tryCatch(async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
});

/**
 * Compares the provided password with the hashed password stored in the database using bcrypt.
 * @param {string} password - The password to compare.
 * @param {string} dbPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - A promise that resolves to true if passwords match, false otherwise.
 */
const comparePassword = tryCatch(async (password, dbPassword) => {
    return await bcrypt.compare(password, dbPassword);
});

module.exports = {
    hashPassword,
    comparePassword
};
