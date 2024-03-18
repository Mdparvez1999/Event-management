const { Redis } = require("ioredis");

// Create a new Redis client instance
const client = new Redis();

// Export the Redis client for use in other modules
module.exports = client;
