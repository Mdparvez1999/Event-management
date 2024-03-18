const mongoose = require("mongoose");

// Define the schema for the Purchase Ticket model
const purchaseTicketSchema = mongoose.Schema(
    {
        // User who purchased the ticket
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        // Event for which the ticket is purchased
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "events"
        },
        // Type of the purchased ticket
        ticketType: {
            type: String,
            required: true,
            trim: true
        },
        // Quantity of tickets purchased
        ticketsQuantity: {
            type: Number,
            required: true,
            trim: true,
        },
        // Total price of the purchase
        totalPrice: {
            type: Number,
            required: true,
            trim: true
        },
        // Timestamp of the purchase
        purchasedAt: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Purchase Ticket schema
module.exports = mongoose.model("purchasedTicket", purchaseTicketSchema);
