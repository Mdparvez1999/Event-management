const Razorpay = require("razorpay");

/**
 * Razorpay instance for handling payment transactions.
 * @module razorpayInstance
 */

/**
 * Create a new instance of Razorpay with provided API keys.
 * @type {Object}
 */
const instance = new Razorpay({
    key_id: 'rzp_test_axTWJozQgtv1cV', // Test API key ID
    key_secret: 'ggMzScMI6LI4RpKdaudtuVQb', // Test API key secret
});

module.exports = instance;
