const mongoose = require("mongoose");

// Define the schema for the Admin model
const adminSchema = mongoose.Schema(
    {
        // Username of the admin 
        userName: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        // Email address of the admin 
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        // Gender of the admin 
        gender: {
            type: String,
            required: true,
            enum: ['male', 'female', 'other']
        },
        // Date of birth of the admin
        DOB: {
            type: Date,
            required: true
        },
        // Password of the admin
        password: {
            type: String,
            required: true,
            trim: true
        },
        // Role of the admin (defaults to 'ADMIN')
        role: {
            type: String,
            default: "ADMIN"
        },
        // Indicates if the admin is active (defaults to true)
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

// Export the Mongoose model for the Admin schema
module.exports = mongoose.model("admin", adminSchema);
