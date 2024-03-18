const mongoose = require("mongoose");
const tryCatch = require("../../utils/tryCatch")

/**
 * Establishes a connection to the MongoDB database 
 * @returns {Promise<boolean>} - A Promise indicating whether the connection was successful.
 */
const dbConnection = tryCatch(async () => {
    const connection = await mongoose.connect(process.env.MONGODB_LOCALURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    if (connection) console.log(`database is connected`);
});

module.exports = dbConnection;

