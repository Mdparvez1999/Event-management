const Ticket = require("../../models/tickets/ticketModel");
const Events = require("../../models/events/eventModel");
const { default: mongoose } = require("mongoose");
const client = require("../../client");
const AppError = require("../../utils/AppError");
const ticketSchema = require("../../middlewares/validationMiddlewares/ticketValidation");
const tryCatch = require("../../utils/tryCatch")

/**
 * createTicketController - Creates a new ticket for a specific event.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - ticket {Object} - Details of the created ticket (if any).
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function creates a new ticket for a specific event based on the provided eventId.
 * It expects the ticket details in the request body and utilizes the Express request, response, and
 * next middleware functions to manage the creation process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and ticket details.
 */
const createTicketController = tryCatch(async (req, res, next) => {
    // validate request body
    const { error, value } = ticketSchema.validate(req.body);

    // handle validarion error
    if (error) {
        return next(error)
    }

    // Destructure ticket details from request body
    const { ticketType, price, ticketsAvailable } = value;

    // Get admin ID from the authenticated user
    const adminId = req.user.id;

    // Check if admin ID is present
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get event ID from request parameters
    const eventId = req.params.id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing event based on event ID
    const existingEvent = await Events.findById(eventId);

    // Check if the event exists
    if (!existingEvent) {
        let msg = "event not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the event is active
    if (!existingEvent.events.active) {
        return res.status(200).json({
            status: true,
            message: "event is inactive"
        });
    }

    // Check if the authenticated user is authorized to create tickets for this event
    if (existingEvent.admin.toString() !== adminId) {
        let msg = "you are not authorized to create tickets";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Create a new ticket for the event
    const newTicket = await Ticket.create({
        admin: adminId,
        event: eventId,
        ticketType,
        price,
        ticketsAvailable
    });

    // Check if the ticket creation was successful
    if (newTicket) {
        return res.status(201).json({
            status: true,
            message: "ticket created successfully",
            ticket: {
                id: newTicket._id,
                type: newTicket.ticketType,
                price: newTicket.price,
                ticketsAvailable: newTicket.ticketsAvailable
            }
        });
    }
});


/**
 * updateTicketByIdController - Updates a ticket based on ticketId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - ticket {Object} - Details of the updated ticket (if any).
 *
 * @throws {Error} - Throws an error if the update operation encounters an issue.
 *
 * @description
 * This controller function handles the update of a ticket based on the provided ticketId. It expects
 * the updated ticket data in the request body and utilizes the Express-validator to validate the data.
 * The function returns a JSON response object indicating the status of the operation, along with
 * an optional message and additional data.
 */
const updateTicketByIdController = tryCatch(async (req, res, next) => {
    // Validate request body using Express-validator
    const { error, value } = ticketSchema.validate(req.body);

    // Handle validation error
    if (error) {
        return next(error);
    }

    // Destructure ticket details from validated request body
    const { ticketType, price, ticketsAvailable } = value;

    // Get admin ID from the authenticated user
    const adminId = req.user.id;

    // Check if admin ID is present
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get ticket ID from request parameters
    const ticketId = req.params.id;

    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
        let msg = "invalid ticket id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing ticket based on ticket ID
    const existingTicket = await Ticket.findById(ticketId);

    // Check if the ticket exists
    if (!existingTicket) {
        let msg = "no tickets found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Get event ID associated with the ticket
    const eventId = existingTicket.event;

    // Check if event ID is present
    if (!eventId) {
        let msg = "no events found with this ticket";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated user is authorized to update this ticket
    if (existingTicket.admin.toString() !== adminId) {
        let msg = "you are not authorized to update this ticket";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Update the ticket based on ticket ID
    const updatedTicket = await Ticket.findByIdAndUpdate(
        ticketId,
        {
            adminId,
            eventId,
            ticketType,
            price,
            ticketsAvailable
        },
        { new: true }
    );

    // Check if the ticket update was successful
    if (!updatedTicket) {
        let msg = "Ticket not found or could not be updated";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Return a success response with updated ticket details
    return res.status(200).json({
        status: true,
        message: "ticket updated successfully",
        ticket: {
            id: updatedTicket._id,
            type: updatedTicket.ticketType,
            price: updatedTicket.price,
            ticketsAvailable: updatedTicket.ticketsAvailable
        }
    });
});


/**
 * deleteTicketsByIdController - Deletes a ticket based on ticketId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *
 * @throws {Error} - Throws an error if the delete operation encounters an issue.
 *
 * @description
 * This controller function handles the deletion of a ticket based on the provided ticketId. It expects
 * the ticketId from the request parameters and utilizes the Express request, response, and next
 * middleware functions to manage the delete process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message.
 */
const deleteTicketsByIdController = tryCatch(async (req, res, next) => {
    // Get ticket ID from request parameters
    const ticketId = req.params.id;

    // Validate ticket ID
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
        let msg = "invalid ticket id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Get admin ID from the authenticated user
    const adminId = req.user.id;

    // Check if admin ID is present
    if (!adminId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Find the existing ticket based on ticket ID
    const existingTicket = await Ticket.findById(ticketId);

    // Check if the ticket exists
    if (!existingTicket) {
        let msg = "no tickets found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated user is authorized to delete this ticket
    if (existingTicket.admin.toString() !== adminId) {
        let msg = "you are not authorized to delete this ticket";
        let err = new AppError(403, msg);
        return next(err);
    }

    // Delete the ticket based on ticket ID
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

    // Check if the ticket deletion was successful
    if (!deletedTicket) {
        let msg = "Ticket not found or could not be deleted";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Return a success response indicating that the ticket was deleted
    return res.status(200).json({
        status: true,
        message: "tickets deleted successfully"
    });
});


/**
 * ticketListByEventController - Retrieves a list of tickets for a specific event.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - tickets {Array} - Array of ticket objects for the specified event.
 *
 * @throws {Error} - Throws an error if the retrieval encounters an issue.
 *
 * @description
 * This controller function retrieves a list of tickets for a specific event based on the provided
 * eventId. It utilizes the Express request, response, and next middleware functions to manage the
 * retrieval process. The function returns a JSON response object indicating the status of the
 * operation, along with an optional message and the array of ticket objects.
 */
const ticketListByEventController = tryCatch(async (req, res, next) => {
    // Get event ID from request parameters
    const eventId = req.params.id;

    // Generate a key for caching based on the event ID
    const key = `tickets:${eventId}`;

    // Check if the data is cached
    const cachedData = await client.get(key);

    // Return cached data if available
    if (cachedData) {
        return res.status(200).json({
            status: true,
            message: "successful",
            tickets: JSON.parse(cachedData)
        });
    }

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if user ID is present
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Find all tickets for the specified event and populate admin details
    const allTickets = await Ticket.find({ event: eventId }).populate({
        path: "admin",
        select: "userName"
    });

    // Check if tickets are found
    if (!allTickets || allTickets.length === 0) {
        let msg = "no tickets found with this event";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Map tickets to the desired format
    const tickets = allTickets.map((doc) => {
        return {
            id: doc._id,
            createdBy: doc.admin.userName,
            type: doc.ticketType,
            price: doc.price,
            ticketsAvailable: doc.ticketsAvailable
        };
    });

    // Cache the tickets data for future use
    await client.set(key, JSON.stringify(tickets), "EX", 60 * 60);

    // Return the tickets in the response
    return res.status(200).json({
        status: true,
        message: "successful",
        tickets: tickets
    });
});


/**
 * singleTicketByIdController - Retrieves information for a single ticket based on the provided ticketId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - ticket {Object} - Information about the requested ticket.
 *
 * @throws {Error} - Throws an error if the retrieval encounters an issue.
 *
 * @description
 * This controller function retrieves information for a single ticket based on the provided ticketId.
 * It utilizes the Express request, response, and next middleware functions to manage the retrieval
 * process. The function returns a JSON response object indicating the status of the operation, along
 * with an optional message and the ticket information.
 */
const singleTicketByIdController = tryCatch(async (req, res, next) => {
    // Get ticket ID from request parameters
    const ticketId = req.params.id;
    console.log(ticketId);

    // Generate a key for caching based on the ticket ID
    const key = `ticket:${ticketId}`;

    // Check if the data is cached
    // const cachedData = await client.get(key);

    // Return cached data if available
    // if (cachedData) {
    //     return res.status(200).json({
    //         status: true,
    //         message: "successful",
    //         ticket: JSON.parse(cachedData)
    //     });
    // }

    // Validate ticket ID
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        let msg = "invalid event id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if user ID is present
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Find the ticket by ID and populate admin details
    const existingTicket = await Ticket.findById(ticketId).populate({
        path: "admin",
        select: "userName"
    });

    // Check if the ticket is found
    if (!existingTicket) {
        let msg = "ticket not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Create a response object with desired format
    const resObj = {
        id: existingTicket._id,
        createBy: existingTicket.admin.userName,
        type: existingTicket.ticketType,
        price: existingTicket.price,
        ticketsAvailable: existingTicket.ticketsAvailable
    };

    // Cache the ticket data for future use
    // await client.set(key, JSON.stringify(resObj), "EX", 60 * 60);

    // Return the ticket information in the response
    return res.status(200).json({
        status: true,
        message: "successful",
        ticket: resObj
    });
});



module.exports = {
    createTicketController,
    updateTicketByIdController,
    deleteTicketsByIdController,
    ticketListByEventController,
    singleTicketByIdController
}