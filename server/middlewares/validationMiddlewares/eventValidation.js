const Joi = require("joi");

/**
 * Joi schema for events.
 */
const eventSchema = Joi.object({
    organizer: Joi.string().required().trim(),
    title: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    date: Joi.date().required(),
    time: Joi.string().required().trim(),
    location: Joi.string().trim().required(),
    category: Joi.array().items(Joi.string()).required()
});

/**
 * Joi schema for images.
 */
const imageSchema = Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/jpg').required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().max(5 * 1024 * 1024).required()
});

/**
 * Joi schema for event ratings.
 */
const eventRatingSchema = Joi.object({
    rating: Joi.number().min(1).max(5)
});

module.exports = {
    eventSchema,
    imageSchema,
    eventRatingSchema
}
