const mongoose = require("mongoose");

// Define the schema for the Event model
const eventSchema = new mongoose.Schema(
    {
        // Admin who created the event
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "admin"
        },
        // Details of the event
        events:
        {
            // Organizer of the event
            organizer: {
                type: String,
                required: true
            },
            // Title of the event
            title: {
                type: String,
                required: true,
                trim: true
            },
            // Description of the event
            description: {
                type: String,
                required: true,
                trim: true
            },
            // Date of the event
            date: {
                type: Date,
                required: true
            },
            // Time of the event
            time: {
                type: String,
                required: true
            },
            // Location of the event
            location: {
                type: String,
                required: true
            },
            // Indicates if the event is active
            active: {
                type: Boolean,
                default: true
            },
            category: [""],
            image: [""]
        },
        // Comments associated with the event
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "comments"
            }
        ],
        // Ratings given to the event
        ratings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "eventRatings"
            }
        ]
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Event schema
module.exports = mongoose.model("events", eventSchema);
