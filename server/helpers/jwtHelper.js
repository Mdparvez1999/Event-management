/**
 * Generates a JWT token with the provided user ID.
 * @param {string} id - The user ID to include in the token payload.
 * @returns {string} - The generated JWT token.
 */
const genToken = (id) => {
    const token = jwt.sign({ id: id }, process.env.SECRET_KEY, { expiresIn: '2h' });
    return token;
};

module.exports = genToken;
