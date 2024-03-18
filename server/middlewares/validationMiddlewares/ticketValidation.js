const Joi = require("joi");

/**
 * Joi schema for ticket details.
 */
const ticketSchema = Joi.object({
    ticketType: Joi.string().required(),
    price: Joi.number().required(),
    ticketsAvailable: Joi.number().required()
});

module.exports = ticketSchema;
