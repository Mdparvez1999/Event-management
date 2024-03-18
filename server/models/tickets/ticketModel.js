const mongoose = require("mongoose");

// Define the schema for the Ticket model
const ticketSchema = new mongoose.Schema(
    {
        // Admin who created the ticket
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "admin"
        },
        // Event associated with the ticket
        event: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "events"
        },
        // Type of the ticket
        ticketType: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        // Price of the ticket
        price: {
            type: Number,
            required: true,
            trim: true
        },
        // Number of tickets available
        ticketsAvailable: {
            type: Number,
            require: true,
            trim: true
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Ticket schema
module.exports = mongoose.model("ticket", ticketSchema);
