const mongoose = require("mongoose");

// Define the schema for the Comment model
const commentSchema = new mongoose.Schema(
    {
        // User who made the comment
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "users"
        },
        // Event to which the comment belongs
        event: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "events"
        },
        // Content of the comment
        comments: {
            type: String,
            required: true,
            trim: true
        },
        // Timestamp of the comment
        time: {
            type: Date,
            default: Date.now
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Comment schema
module.exports = mongoose.model("comments", commentSchema);
