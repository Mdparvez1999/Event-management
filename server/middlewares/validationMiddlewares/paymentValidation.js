const Joi = require("joi");

/**
 * Joi schema for payment details.
 */
const paymentSchema = Joi.object({
    razorpay_payment_id: Joi.string().required(),
    razorpay_order_id: Joi.string().required(),
    razorpay_signature: Joi.string().required()
});

module.exports = paymentSchema;
