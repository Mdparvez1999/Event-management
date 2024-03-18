const { default: mongoose } = require("mongoose");
const Ticket = require("../../models/tickets/ticketModel");
const PurchaseTicketModel = require("../../models/purchaseTicket/purchaseTicketModel");
const client = require("../../client");
const tryCatch = require("../../utils/tryCatch");
const purchaseTicketSchema = require("../../middlewares/validationMiddlewares/purchaseTicketValidation");
const AppError = require("../../utils/AppError");

/**
 * purchaseTicketController - Handles the purchase of tickets based on the provided ticket ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the purchase operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the purchase (if any).
 *
 * @throws {Error} - Throws an error if the purchase operation encounters an issue.
 *
 * @description
 * This controller function handles the purchase of tickets based on the provided ticket ID. It expects
 * the ticket type and quantity in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the purchase process. The function returns a JSON response object
 * indicating the status of the purchase operation, along with an optional message and additional data.
 */
const purchaseTicketController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = purchaseTicketSchema.validate(req.body);

    // Handle validation error
    if (error) {
        return next(error);
    }

    // Extract ticket type and quantity from validated value
    const { ticketType, ticketsQuantity } = value;

    // Get user ID from request
    const userId = req.user.id;

    // Check if user is authorized
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get ticket ID from request parameters
    const ticketId = req.params.id;

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        let msg = "invalid event id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing ticket based on the provided ticket ID
    const existingTicket = await Ticket.findById(ticketId);

    // Check if ticket exists
    if (!existingTicket) {
        let msg = "no tickets found";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Check if the provided ticket type matches the existing ticket type
    if (existingTicket.ticketType !== ticketType) {
        let msg = "invalid ticket type";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Check if the requested quantity is available
    if (ticketsQuantity > existingTicket.ticketsAvailable) {
        let msg = "tickets not available";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Calculate total price based on the existing ticket price and requested quantity
    const totalPrice = existingTicket.price * ticketsQuantity;

    // Create a new purchased ticket record
    const newPurchasedTicket = await PurchaseTicketModel.create({
        user: userId,
        event: existingTicket.event,
        ticketType,
        ticketsQuantity,
        totalPrice
    });

    // Check if the purchase was successful
    if (!newPurchasedTicket) {
        let msg = "purchase failed, try again later";
        let err = new AppError(400, msg);
        return next(err);
    }

    // update and save available tickets
    const updatedTicket = updateTicketsAvailable(existingTicket, ticketsQuantity);
    await updatedTicket.save();

    // Return a success response with details of the purchased ticket
    return res.status(201).json({
        status: true,
        message: "purchase successful",
        data: {
            id: newPurchasedTicket._id,
            ticketType: newPurchasedTicket.ticketType,
            quantity: newPurchasedTicket.ticketsQuantity,
            price: newPurchasedTicket.totalPrice
        }
    });
});


/**
 * getAllPurchasedTicketsController - Retrieves all purchased tickets for the authenticated user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - tickets {Array} - Array of purchased tickets (if any).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function retrieves all purchased tickets for the authenticated user. It uses the
 * user ID from the request to fetch the corresponding tickets. The function returns a JSON response
 * object indicating the status of the operation, along with an optional message and the array of
 * purchased tickets.
 */
const getAllPurchasedTicketsController = tryCatch(async (req, res) => {
    // Get user ID from request
    const userId = req.user.id;

    // Check if user is authorized
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Create a key for caching user-specific ticket data
    const key = `users:${userId}`;

    // Retrieve cached data if available
    // const cachedData = await client.get(key);

    // Check if cached data is available
    // if (cachedData) {
    //     return res.status(200).json({
    //         status: true,
    //         message: "successful",
    //         tickets: JSON.parse(cachedData)
    //     });
    // }

    // Find all purchased tickets for the user
    const allTickets = await PurchaseTicketModel.find({ user: userId });

    // Check if tickets are found
    if (!allTickets || allTickets.length === 0) {
        let msg = "no tickets found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Map purchased tickets to a simplified format
    const tickets = allTickets.map((doc) => {
        return {
            id: doc._id,
            ticket: doc.ticketType,
            ticketsQuantity: doc.ticketsQuantity,
            price: doc.totalPrice
        };
    });

    // Cache the user-specific ticket data
    await client.set(key, JSON.stringify(tickets), "EX", 60 * 60);

    // Return a success response with the array of purchased tickets
    return res.status(200).json({
        status: true,
        message: "successful",
        tickets
    });
});


/**
 * purchasedTicketByIdController - Retrieves a purchased ticket by its ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - ticket {Object} - Purchased ticket details (if found).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function retrieves a purchased ticket by its ID. It uses the provided ticket ID
 * from the request to fetch the corresponding ticket details. The function returns a JSON response
 * object indicating the status of the operation, along with an optional message and the purchased
 * ticket details.
 */
const purchasedTicketByIdController = tryCatch(async (req, res) => {
    // Get purchased ticket ID from request
    const purchasedTicketId = req.params.id;

    // Create a key for caching purchased ticket data
    const key = `user:${purchasedTicketId}`;

    // Retrieve cached data if available
    // const cachedData = await client.get(key);

    // Check if cached data is available
    // if (cachedData) {
    //     return res.status(200).json({
    //         status: true,
    //         message: "successful",
    //         ticket: JSON.parse(cachedData)
    //     });
    // }

    // Get user ID from request
    const userId = req.user.id;

    // Check if user is authorized
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Check if the provided ticket ID is valid
    if (!mongoose.Types.ObjectId.isValid(purchasedTicketId)) {
        let msg = "invalid ticket id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the purchased ticket by its ID
    const purchasedTicket = await PurchaseTicketModel.findById(purchasedTicketId);
    // console.log(purchasedTicket);

    // Check if the purchased ticket is found
    if (!purchasedTicket) {
        let msg = "no tickets found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Create a simplified response object for the purchased ticket
    const resObj = {
        id: purchasedTicket._id,
        ticketType: purchasedTicket.ticketType,
        ticketsQuantity: purchasedTicket.ticketsQuantity,
        price: purchasedTicket.totalPrice
    };

    // Cache the purchased ticket data
    // await client.set(key, JSON.stringify(resObj), "EX", 60 * 60);

    // Return a success response with the purchased ticket details
    return res.status(200).json({
        status: true,
        message: "successful",
        ticket: resObj
    });
});

/**
 * updateTicketsAvailable - Updates the available ticket quantity.
 *
 * @param {Object} ticket - The ticket object to be updated.
 * @param {number} quantity - The quantity to be deducted from available tickets.
 *
 * @returns {Object} - The updated ticket object.
 *
 * @description
 * This function takes a ticket object and a quantity, subtracts the quantity from the available
 * tickets, and returns the updated ticket object. It is used to maintain and update the available
 * ticket quantity after a purchase or any operation that involves reducing the available tickets.
 */
const updateTicketsAvailable = (ticket, quantity) => {
    // Calculate remaining tickets after deducting the quantity
    let remainingTickets = ticket.ticketsAvailable - quantity;

    // Update the ticketsAvailable property in the ticket object
    if (remainingTickets >= 0) {
        ticket.ticketsAvailable = remainingTickets;
    } else {
        ticket.ticketsAvailable = 0
    }

    // Return the updated ticket object
    return ticket;
};


module.exports = {
    purchaseTicketController,
    getAllPurchasedTicketsController,
    purchasedTicketByIdController
}