const Joi = require("joi");

/**
 * Joi schema for comments.
 */
const commentSchema = Joi.object({
    comment: Joi.string().trim().required()
});

module.exports = commentSchema;
