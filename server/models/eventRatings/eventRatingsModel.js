const mongoose = require("mongoose");

// Define the schema for the Event Rating model
const eventRatingSchema = new mongoose.Schema(
    {
        // Event being rated
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events"
        },
        // User who rated the event
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        // Rating given to the event
        rating: {
            type: Number,
            min: 1,
            max: 5,
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Event Rating schema
module.exports = mongoose.model("eventRatings", eventRatingSchema);
