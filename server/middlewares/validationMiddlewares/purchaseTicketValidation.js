const Joi = require("joi");

/**
 * Joi schema for purchasing tickets.
 */
const purchaseTicketSchema = Joi.object({
    ticketType: Joi.string().required(),
    ticketsQuantity: Joi.number().required()
});

module.exports = purchaseTicketSchema;
