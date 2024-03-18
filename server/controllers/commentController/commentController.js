const Comments = require("../../models/comments/commentsModel");
const mongoose = require("mongoose");
const Event = require("../../models/events/eventModel");
const client = require("../../client");
const tryCatch = require("../../utils/tryCatch");
const commentSchema = require("../../middlewares/validationMiddlewares/commentsValidation");
const AppError = require("../../utils/AppError");

/**
 * writeCommentsController - Adds a comment to an event based on the provided eventId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the comment (if any).
 *
 * @throws {Error} - Throws an error if the comment operation encounters an issue.
 *
 * @description
 * This controller function adds a comment to an event based on the provided eventId. It expects
 * the comment data in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the comment addition process. The function returns a JSON response
 * object indicating the status of the operation, along with an optional message and additional data.
 */
const writeCommentsController = tryCatch(async (req, res, next) => {
    // Validate comment data from the request body
    const { error, value } = commentSchema.validate(req.body);

    // Handle validation errors
    if (error) {
        return next(error);
    }

    // Extract comment from the validated data
    const { comment } = value;

    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if user ID is present
    if (!userId) {
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

    // Find the existing event based on the event ID
    const existingEvent = await Event.findById(eventId);

    // Check if the event is found
    if (!existingEvent) {
        let msg = "event not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Create a new comment
    const newComment = await Comments.create({
        user: userId,
        event: eventId,
        comments: comment
    });

    // Check if the comment creation is successful
    if (!newComment) {
        let msg = "Failed to add comment";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Add the comment to the existing event's comments array
    existingEvent.comments.push(newComment._id);

    // Save the updated event
    await existingEvent.save();

    // Return a success response with the comment details
    return res.status(200).json({
        status: true,
        message: "comment added successfully",
        data: {
            id: newComment._id,
            comment: newComment.comments,
            time: newComment.time
        }
    });
});


/**
 * editCommentController - Edits a user's comment based on the provided commentId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - data {Object} - Additional data related to the edited comment (if any).
 *
 * @throws {Error} - Throws an error if the comment edit operation encounters an issue.
 *
 * @description
 * This controller function edits a user's comment based on the provided commentId. It expects
 * the edited comment data in the request body and utilizes the Express request, response, and next
 * middleware functions to manage the comment editing process. The function returns a JSON response
 * object indicating the status of the operation, along with an optional message and additional data.
 */
const editCommentController = tryCatch(async (req, res, next) => {
    // Validate comment data from the request body
    const { error, value } = commentSchema.validate(req.body);

    // Handle validation errors
    if (error) {
        return next(error);
    }

    // Extract comment from the validated data
    const { comment } = value;

    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if user ID is present
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get comment ID from request parameters
    const commentId = req.params.id;

    // Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        let msg = "invalid comment Id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing comment based on the comment ID
    const existingComment = await Comments.findById(commentId);

    // Check if the comment is found
    if (!existingComment) {
        let msg = "comment not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated user is the author of the comment
    if (existingComment.user.toString() !== userId) {
        let msg = "you are not authorized to edit this comment";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Edit the comment
    const editedComment = await Comments.findByIdAndUpdate(
        commentId,
        {
            user: userId,
            event: existingComment.event,
            comments: comment
        },
        {
            new: true
        }
    );

    // Check if the comment edit is successful
    if (!editedComment) {
        let msg = "failed to edit comment";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Return a success response with the edited comment details
    return res.status(200).json({
        status: true,
        message: "comment updated successfully",
        data: {
            id: editedComment._id,
            comment: editedComment.comments
        }
    });
});


/**
 * deleteCommentController - Deletes a user's comment based on the provided commentId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *
 * @throws {Error} - Throws an error if the comment deletion operation encounters an issue.
 *
 * @description
 * This controller function deletes a user's comment based on the provided commentId. It expects
 * the comment ID from the request parameters and utilizes the Express request, response, and next
 * middleware functions to manage the comment deletion process. The function returns a JSON response
 * object indicating the status of the operation, along with an optional message.
 */
const deleteCommentController = tryCatch(async (req, res, next) => {
    // Get user ID from the authenticated user
    const userId = req.user.id;

    // Check if user ID is present
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Get comment ID from request parameters
    const commentId = req.params.id;

    // Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        let msg = "invalid comment Id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find the existing comment based on the comment ID
    const existingComment = await Comments.findById(commentId);

    // Check if the comment is found
    if (!existingComment) {
        let msg = "comment not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Check if the authenticated user is the author of the comment
    if (existingComment.user.toString() !== userId) {
        let msg = "you are not authorized to delete this comment";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Delete the comment
    const deletedComment = await Comments.findByIdAndDelete(commentId);

    // Check if the comment deletion is successful
    if (!deletedComment) {
        let msg = "failed to delete comment, try again later";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Return a success response
    return res.status(200).json({
        status: true,
        message: "comment deleted successfully"
    });
});


/**
 * commentListController - Retrieves all comments for a given event based on the provided eventId.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - message {string} - Describes the outcome or error message.
 *   - allComments {Array} - Array of comments for the specified event (if any).
 *
 * @throws {Error} - Throws an error if the comment retrieval operation encounters an issue.
 *
 * @description
 * This controller function retrieves all comments for a given event based on the provided eventId.
 * It utilizes Redis caching to store and retrieve comments for improved performance. The function
 * expects the event ID from the request parameters and utilizes the Express request, response, and
 * next middleware functions to manage the comment retrieval process. The function returns a JSON
 * response object indicating the status of the operation, along with an optional message and an array
 * of comments for the specified event (if any).
 */
const commentListController = tryCatch(async (req, res, next) => {
    // Get event ID from request parameters
    const eventId = req.params.id;

    // Create a key for Redis cache
    const key = `comment:${eventId}`;

    // Retrieve cached data from Redis
    const cachedData = await client.get(key);

    // Check if cached data exists
    if (cachedData) {
        // Return cached data as a response
        return res.status(200).json({
            status: true,
            message: "successful",
            allComments: JSON.parse(cachedData)
        });
    }

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        let msg = "invalid event id";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Find all comments for the specified event
    const commentsResult = await Comments.find({ event: eventId }).populate({
        path: "user",
        select: "userName"
    });

    // Check if comments are found
    if (!commentsResult || commentsResult.length === 0) {
        let msg = "no comments found for this event";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Map comments to a formatted array
    const allComments = commentsResult.map((doc) => {
        return {
            id: doc._id,
            user: doc.user,
            comment: doc.comments,
            time: doc.createdAt.toLocaleString()
        };
    });

    // Store comments in Redis cache with an expiration time of 60 minutes
    await client.set(key, JSON.stringify(allComments), "EX", 60 * 60);

    // Return a success response with comments
    return res.status(200).json({
        status: true,
        message: "successful",
        allComments
    });
});


module.exports = {
    writeCommentsController,
    editCommentController,
    deleteCommentController,
    commentListController
}
