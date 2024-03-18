const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin"
        },
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("category", categorySchema);