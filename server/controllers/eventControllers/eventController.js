const Events = require("../../models/events/eventModel");
const { default: mongoose } = require("mongoose");
const Ratings = require("../../models/eventRatings/eventRatingsModel")
const calculateAvg = require("../../helpers/eventHelper");
const client = require("../../client");
const { eventSchema, eventRatingSchema, imageSchema } = require("../../middlewares/validationMiddlewares/eventValidation");
const tryCatch = require("../../utils/tryCatch");
const AppError = require("../../utils/AppError");

/**
 * Controller function for creating events.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - event {Object} - Details of the created event (if successful).
 *
 * @throws {Error} - Throws an error if the event creation encounters an issue.
 *
 * @description
 * This controller function handles the creation of events based on the provided data in the request body.
 * It validates the request body and file (if applicable), extracts necessary values, and then creates a new event
 * in the database. It requires authentication to ensure the request is made by an authorized user. Upon successful
 * event creation, it returns a JSON response object indicating the status of the operation along with the
 * created event details.
 */
const createEventsController = tryCatch(async (req, res, next) => {
    // Validate request body
    const { error, value } = eventSchema.validate(req.body);

    // Handle validation error
    if (error) {
        return next(error);
    }

    // Validate file
    const { error: fileError, value: fileValue } = imageSchema.validate(req.file);

    // Handle validation error for file
    if (fileError) {
        return next(fileError);
    }

    // Extract values from validated data
    const { organizer, title, description, date, time, location, category } = value;

    // Retrieve filename of the uploaded image
    const image = fileValue.filename;

    // Get ID from authenticated admin
    const adminId = req.user._id;

    // Check if the request is unauthorized
    if (!adminId) {
        let msg = "Unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Create new event
    const newEvent = await Events.create({
        admin: adminId,
        events: {
            organizer,
            title,
            description,
            date,
            time,
            location,
            category,
            image
        }
    });

    // Build response data
    const event = buildEventData(newEvent);

    // Send success response
    return res.status(201).json({
        status: true,
        message: "Event created successfully",
        event
    });
});

/**
 * Controller function for retrieving a list of events.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - count {number} - Number of events retrieved.
 *   - total {number} - Total number of events in the database.
 *   - events {Array} - Array of event objects (if any).
 *
 * @throws {Error} - Throws an error if the retrieval encounters an issue.
 *
 * @description
 * This controller function handles the retrieval of a list of events based on the provided query parameters,
 * such as title, location, date, and category. It implements pagination to limit the number of events
 * retrieved per page. It first checks if there are cached data available for all events or filtered events.
 * If cached data is found, it returns the cached data. If not, it proceeds to query the database based on
 * the provided filters. It then populates the event data with the admin's username and sends the response
 * with the retrieved events along with other relevant information such as the total count of events.
 */
const eventsListController = tryCatch(async (req, res, next) => {
    // Destructuring query parameters
    let { title, location, date, category } = req.query;

    // Pagination parameters
    const limit = 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const sortBy = "rating";

    // If no filters applied, retrieve all events
    if (!title && !location && !date && !category) {
        // Check if cached data available for all events
        const cachedData = await client.get("all_events");
        const data = JSON.parse(cachedData);

        // Return cached data if available
        if (cachedData) {
            return res.status(200).json({
                status: true,
                message: "Successful",
                data
            });
        }

        // Query all events from database
        const allEvents = await Events.find()
            .populate({
                path: "admin",
                select: "userName"
            })
            .limit(limit)
            .skip(skip)
            .sort(sortBy);

        // Return error if no events found
        if (!allEvents) {
            let msg = "No events found";
            let err = new AppError(404, msg);
            return next(err);
        }

        // Format retrieved events
        const events = allEvents.map(event => {
            if (event.events.active) {
                return {
                    id: event._id,
                    createdBy: event.admin.userName,
                    event: event.events
                };
            }
        });

        // Get total count of events
        const total = await Events.countDocuments();

        // Cache retrieved events
        await client.set("all_events", JSON.stringify(events), "EX", 60 * 60);

        // Send response with retrieved events
        return res.status(200).json({
            status: true,
            message: "Successful",
            count: events.length,
            total,
            events: events.length > 0 ? events : 'No events found'
        });
    }

    // Check if cached data available for filtered events
    const cachedData = await client.get("events:filter");

    // Return cached data if available
    if (cachedData) {
        return res.status(200).json({
            status: true,
            message: "Successful",
            cachedData
        });
    }

    // Initialize query object
    let query = {};

    // Apply filters if provided
    if (title) {
        query['events.title'] = { $regex: title, $options: 'i' };
    }
    if (location) {
        query['events.location'] = { $regex: location, $options: 'i' };
    }
    if (date) {
        const validDate = new Date(date);
        // Validate date
        if (!validDate) {
            let msg = "Please provide a valid date";
            let err = new AppError(400, msg);
            return next(err);
        }
        query['events.date'] = { $eq: validDate };
    }
    if (category) {
        query['events.category'] = { $regex: category, $options: 'i' };
    }

    // Query filtered events from database
    const allEvents = await Events.find(query)
        .populate({
            path: "admin",
            select: "userName"
        })
        .skip(skip)
        .limit(limit)
        .sort(sortBy);

    // Return error if no events found
    if (!allEvents) {
        let msg = "No events found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Format retrieved events
    const events = allEvents.map(event => {
        return {
            id: event._id,
            createdBy: event.admin.userName,
            event: event.events
        };
    });

    // Cache retrieved events
    await client.set("events:filter", JSON.stringify(events), "EX", 120);

    // Send response with retrieved events
    return res.status(200).json({
        status: true,
        message: "Successful",
        events: events.length > 0 ? events : 'No events'
    });
});

/**
 * Controller function for retrieving an event by its ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - event {Object} - Details of the retrieved event.
 *
 * @throws {Error} - Throws an error if the retrieval encounters an issue.
 *
 * @description
 * This controller function retrieves an event based on the provided event ID. It first checks if the event
 * data is cached. If cached data is found, it returns the cached data. If not, it proceeds to query the
 * database for the event details. Once retrieved, it calculates the average rating for the event and
 * formats the event data along with ratings information. If the event is not active, it returns a message
 * indicating that the event is not active. Finally, it caches the event data and sends the response.
 */
const getEventsByIdController = tryCatch(async (req, res, next) => {
    // Get event ID from request parameters
    const eventId = req.params.id;

    // Generate a key for caching
    const key = `event:${eventId}`;

    // Check if the data is cached
    const cachedData = await client.get(key);

    // Return data if it is available in cache
    if (cachedData) {
        return res.status(200).json({
            events: JSON.parse(cachedData)
        });
    }

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "Invalid event ID";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Retrieve event details from the database
    const existingEvent = await Events.findById(eventId)
        .populate({
            path: "admin",
            select: "userName"
        })
        .populate({
            path: "ratings",
            populate: {
                path: "user",
                select: "userName"
            }
        });

    // Handle event not found
    if (!existingEvent) {
        let msg = "No event found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Map ratings to a user-friendly format
    const ratings = existingEvent.ratings.map(doc => {
        return {
            user: doc.user === null ? 'account deleted' : doc.user,
            rating: doc.rating
        };
    });

    // Calculate average rating
    const avgRating = calculateAvg(ratings);

    // Build response data
    const event = buildEventDataById(existingEvent, avgRating, ratings);

    // Check if the event is active
    if (!existingEvent.events.active) {
        return res.status(200).json({
            status: true,
            message: "Event not active"
        });
    }

    // Cache the data
    await client.set(key, JSON.stringify(event), "EX", 60 * 60);

    // Send success response
    return res.status(200).json({
        status: true,
        message: "Successful",
        event
    });
});


/**
  * Builds the event data for the response based on database information,
  * average rating, and ratings.
 * @param {Object} event - event object from database 
 * @param {Number} avgRating - value of ratings
 * @param {Object} ratings - ratings object from event
 * @returns {Object} - event data fro response
 */
function buildEventDataById(event, avgRating, ratings) {
    // Initialize the response object with essential event details
    let response = {
        id: event._id,
        createdBy: event.admin.userName,
        organizer: event.events.organizer,
        title: event.events.title,
        description: event.events.description,
        date: event.events.date,
        time: event.events.time,
        location: event.events.location,
        active: event.events.active,
        // image: event.events.image[0].filename
    }

    // Include ratings information if available
    if (ratings.length !== 0 || avgRating > 0) {
        response.averageRating = avgRating,
            response.ratings = ratings
    }

    return response;
}

/**
 * updateEventByIdController - Updates an event based on eventId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the update (if any).
 *
 * @throws {Error} - Throws an error if the update operation encounters an issue.
 *
 * @description
 * This controller function handles the update of an event based on the provided eventId. It expects
 * the updated event data in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the update process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and additional data.
 */
const updateEventByIdController = tryCatch(async (req, res) => {
    // validate req body
    const { error, value } = eventSchema.validate(req.body);

    // handle validation erros
    if (error) {
        return next(error)
    }

    // extract valaues from validated data
    const { organizer, title, description, date, time, location } = req.body;

    // const image = req.file;

    // get event id from request parameters
    const eventId = req.params.id;

    // validate eventID 
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id"
        let err = new AppError(400, msg);
        return next(err);
    };

    // retrieve event details from the database
    const existingEvent = await Events.findById(eventId);

    // handle event not found
    if (!existingEvent) {
        let msg = "event not found"
        let err = new AppError(404, msg);
        return next(err);
    };

    // get admin id from request user
    const adminId = req.user.id;

    // handle unauthorized access
    if (!adminId) {
        let msg = "unauthorized access"
        let err = new AppError(401, msg);
        return next(err);
    };

    // Check if the authenticated user is authorized to update the account
    if (existingEvent.admin.toString() !== adminId) {
        let msg = "unauthorized to update this event"
        let err = new AppError(403, msg);
        return next(err);
    };

    // Update event
    const updatedEvent = await Events.findByIdAndUpdate(eventId, {
        admin: adminId,
        events: {
            organizer,
            title,
            description,
            date,
            time,
            location,
            image
        }
    },
        { new: true }
    );

    // Check if the update was successful
    if (!updatedEvent) {
        let msg = "Event not found or could not be updated"
        let err = new AppError(400, msg);
        return next(err);
    };

    // send a success response
    return res.status(200).json({
        status: true,
        message: "event details updated successfully",
        event: {
            id: updatedEvent._id,
            organizer: updatedEvent.events.organizer,
            title: updatedEvent.events.title,
            description: updatedEvent.events.description,
            date: updatedEvent.events.date.toLocaleDateString(),
            time: updatedEvent.events.time,
            location: updatedEvent.events.location
        }
    })
});

/**
 * deleteEventByIdController - Deletes an event based on eventId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the deletion (if any).
 *
 * @throws {Error} - Throws an error if the deletion operation encounters an issue.
 *
 * @description
 * This controller function handles the deletion of an event based on the provided eventId. It expects
 * the Express request parameters to contain the eventId. The function performs validations, checks
 * for unauthorized access, and ensures the existence of the event. If the authenticated user is
 * authorized to delete the event, it proceeds with the deletion and returns a JSON response object
 * indicating the status of the operation, along with an optional message and additional data.
 */
const deleteEventByIdController = tryCatch(async (req, res, next) => {
    // get event id from request parameters
    const eventId = req.params.id;

    // validate eventID 
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id"
        let err = new AppError(400, msg);
        return next(err);
    };

    // get admin id from request user
    const adminId = req.user.id;

    // handle unauthorized access
    if (!adminId) {
        let msg = "unauthorized access"
        let err = new AppError(401, msg);
        return next(err);
    };

    // find existing event
    const existingEvent = await Events.findById(eventId);

    // handle event not found
    if (!existingEvent) {
        let msg = "event not found"
        let err = new AppError(404, msg);
        return next(err);
    };

    // Check if the authenticated user is authorized to delete the account
    if (existingEvent.admin.toString() !== adminId) {
        let msg = "unauthorized to delete this event"
        let err = new AppError(403, msg);
        return next(err);
    }

    // delete event
    const deletedEvent = await Events.findByIdAndDelete(eventId);

    // Check if the delete was successful
    if (!deletedEvent) {
        let msg = "could not delete event, try again later"
        let err = new AppError(400, msg);
        return next(err);
    }

    // send a success response
    return res.status(200).json({
        status: true,
        message: "event deleted successfully"
    });
});

/**
 * eventRatingsController - Handles the submission of ratings for an event.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the rating submission (if any).
 *
 * @throws {Error} - Throws an error if the rating submission encounters an issue.
 *
 * @description
 * This controller function handles the submission of ratings for a specific event based on the
 * provided eventId. It expects the rating data in the request body and validates it using the
 * eventSchema. The function performs various checks, including unauthorized access, existing event
 * validation, duplicate ratings prevention, and finally, it saves the new rating and updates the
 * corresponding event with the rating's reference. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and additional data.
 */
const eventRatingsController = tryCatch(async (req, res) => {
    // Validate request body using eventSchema
    const { error, value } = eventRatingSchema.validate(req.body);

    // Handle validation errors
    if (error) {
        return next(error);
    }

    // Extract rating from request body
    const { rating } = req.body;

    // Get user ID from request
    const userId = req.user.id;

    // Check for unauthorized access
    if (!userId) {
        let msg = "unauthorized access"
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get event ID from request parameters
    const eventId = req.params.id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id"
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find existing event by ID
    const existingEvent = await Events.findById(eventId);

    // Handle event not found
    if (!existingEvent) {
        let msg = "event not found"
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check for duplicate ratings by user and event
    const duplicateRating = await Ratings.findOne({
        event: eventId,
        user: userId
    });

    // If duplicate rating exists, return an error
    if (duplicateRating) {
        let msg = "you can only submit a rating once"
        let err = new AppError(400, msg);
        return next(err);
    }

    // Create a new rating
    const newRating = await Ratings.create({
        event: eventId,
        user: userId,
        rating: rating
    });

    // If new rating creation fails, return an error
    if (!newRating) {
        let msg = "ratings cannot be submitted, please try again later"
        let err = new AppError(400, msg);
        return next(err);
    }

    // Update existing event with the new rating's reference
    existingEvent.ratings.push(newRating._id);
    await existingEvent.save();

    // Return a success response with the new rating details
    return res.status(200).json({
        status: true,
        message: "rating submitted successfully",
        data: {
            id: newRating._id,
            rating: newRating.rating
        }
    });

});

/**
 * toggleEventController - Toggles the activation status of an event based on eventId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the toggle (if any).
 *
 * @throws {Error} - Throws an error if the toggle operation encounters an issue.
 *
 * @description
 * This controller function handles the toggle of an event's activation status based on the provided eventId.
 * It expects the toggle status in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the toggle process. The function returns a JSON response object
 * indicating the status of the operation, along with an optional message and additional data.
 */
const toggleEventController = tryCatch(async (req, res, next) => {
    // Validate request body using eventSchema
    const { error, value } = eventSchema.validate(req.body);

    // Handle validation errors
    if (error) {
        return next(error);
    }

    // Extract toggle status from request body
    const { toggle } = req.body;

    // Get admin ID from request user
    const adminId = req.user.id;

    // Check for unauthorized access
    if (!adminId) {
        let msg = "unauthorized access"
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get event ID from request parameters
    const eventId = req.params.id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id"
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find existing event by ID
    const existingEvent = await Events.findById(eventId);

    // Handle event not found
    if (!existingEvent) {
        let msg = "event not found"
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated admin is authorized to update the event
    if (existingEvent.admin.toString() !== adminId) {
        let msg = "unauthorized to update this event"
        let err = new AppError(403, msg);
        return next(err);
    }

    // Determine the new activation status based on the toggle value
    let active = true;
    if (!toggle) {
        active = false;
    }

    // Update the event's activation status
    const updatedEvent = await Events.findByIdAndUpdate(
        eventId,
        { active: active },
        { new: true }
    );

    // Check if the update was successful
    if (!updatedEvent) {
        let msg = "Cannot make the event inactive"
        let err = new AppError(404, msg);
        return next(err);
    }

    // Return a success response
    return res.status(200).json({
        status: true,
        message: `event has been ${toggle ? "activated" : "inactivated"}`
    });
});

/**
 * buildEventData - Build event data for the response.
 *
 * @param {Object} event - User object from the database.
 * @returns {Object} - User data for the response.
 */
function buildEventData(event) {
    return {
        id: event._id,
        organizer: event.events.organizer,
        title: event.events.title,
        description: event.events.description,
        date: event.events.date,
        time: event.events.time,
        location: event.events.location,
        category: event.events.category,
    }
};

module.exports = {
    createEventsController,
    eventsListController,
    getEventsByIdController,
    updateEventByIdController,
    deleteEventByIdController,
    eventRatingsController,
    toggleEventController
}
