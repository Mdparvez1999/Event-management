const Joi = require("joi");

/**
 * Joi schema for category.
 */
const categorySchema = Joi.object({
    name: Joi.string().required()
});

module.exports = categorySchema;
