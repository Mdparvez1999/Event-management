// Import required modules and libraries
const express = require("express");
const env = require("dotenv");
const dbConnection = require("./config/database/dbConfig");
const CORS = require("cors");
const helmet = require("helmet");
const userRouter = require("./routes/userRoutes/userRoutes");
const adminRouter = require("./routes/adminRoutes/adminRoutes");
const categoryRouter = require("./routes/categoryRoutes/categoryRoutes");
const eventRouter = require("./routes/eventRoutes/eventRoutes");
const ticketRouter = require("./routes/ticketRoutes/ticketRoutes");
const commentRouter = require("./routes/commentRoutes/commentRoutes");
const purchaseTicketRouter = require("./routes/purchaseTicketRoutes/purchaseTicketRoute");
const paymentRouter = require("./routes/paymentRoutes/paymentRoutes");
const errorHandler = require("./middlewares/errorHandler/errorHandler");
const passport = require("passport");

// Load environment variables from .env file
env.config();

// Connect to the database
dbConnection();

// Initialize Express application
const app = express();

// Enhance security with Helmet middleware
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(CORS({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH",
}));

// Initialize Passport authentication middleware
app.use(passport.initialize());
require("./config/passport-jwt/passportJwtConfig");

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/purchaseTickets", purchaseTicketRouter);
app.use("/api/v1/payment", paymentRouter);

// Handle undefined routes
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `This path ${req.url} doesn't exist`
    });
});

// Global error handler middleware
app.use(errorHandler);

// Export the Express application
module.exports = app;
