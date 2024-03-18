const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = mongoose.Schema(
    {
        // Username of the user
        userName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        // Email address of the user
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        // Gender of the user
        gender: {
            type: String,
            required: true,
            enum: ['male', 'female', 'other']
        },
        // Date of birth of the user
        DOB: {
            type: Date,
            required: true
        },
        // Password of the user
        password: {
            type: String,
            required: true,
            trim: true
        },
        // Role of the user
        role: {
            type: String,
            default: "USER"
        },
        // Indicates if the user is active (defaults to true)
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        // Automatically add timestamps for createdAt and updatedAt fields
        timestamps: true
    }
);

// Export the Mongoose model for the User schema
module.exports = mongoose.model("users", userSchema);
