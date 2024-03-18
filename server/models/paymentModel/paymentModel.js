const mongoose = require("mongoose");

// Define the schema for the Payment model
const paymentSchema = new mongoose.Schema(
    {
        // User who made the payment
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        // Razorpay payment ID
        razorpay_payment_id: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        // Razorpay order ID
        razorpay_order_id: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        // Razorpay signature
        razorpay_signature: {
            type: String,
            required: true,
            trim: true,
            unique: true
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the Payment schema
module.exports = mongoose.model('payments', paymentSchema);
