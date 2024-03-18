const instance = require("../../config/paymentConfig/razorPayConfig");
const paymentSchema = require("../../middlewares/validationMiddlewares/paymentValidation");
const purchaseTicketModel = require("../../models/purchaseTicket/purchaseTicketModel");
const tryCatch = require("../../utils/tryCatch");
const crypto = require("crypto");
const AppError = require("../../utils/AppError");
const paymentModel = require("../../models/paymentModel/paymentModel")

let orderId;

/**
 * Initiates the checkout process for a purchased ticket.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - status {boolean} - Indicates the status of the operation.
 *   - order {Object} - Details of the created order.
 *
 * @throws {Error} - Throws an error if the operation encounters an issue.
 *
 * @description
 * This controller function initiates the checkout process for a purchased ticket identified by the provided
 * purchasedTicketId. It utilizes the Express request, response, and next middleware functions to manage
 * the checkout process. The function returns a JSON response object indicating the status of the operation
 * and details of the created order.
 */
const checkoutController = tryCatch(async (req, res, next) => {
    // Get purchased ticket ID from request parameters
    const purchasedTicketId = req.params.id;

    // Find the purchased ticket based on its ID
    const purchasedTicket = await purchaseTicketModel.findById(purchasedTicketId);

    // Handle purchased ticket not found
    if (!purchasedTicket) {
        let msg = "purchased ticket not found";
        let err = new AppError(404, msg);
        return next(err);
    }

    // Define options for the order creation
    const options = {
        amount: purchasedTicket.totalPrice * 100, // Convert totalPrice to cents
        currency: 'INR'
    };

    // Create the order
    const order = await instance.orders.create(options);

    // Send success response with order details
    return res.json({
        status: true,
        order
    });
});


/**
 * Retrieves the Razorpay API key.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object.
 *   - success {boolean} - Indicates the success of the operation.
 *   - key {string} - Razorpay API key.
 *
 * @description
 * This controller function retrieves the Razorpay API key and sends it as a JSON response.
 */
const getRazorPayKeyController = tryCatch(async (req, res, next) => {
    return res.status(200).json({
        success: true,
        key: 'rzp_test_axTWJozQgtv1cV'
    });
});


/**
 * Verifies the payment and creates a new payment entry.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - JSON response object indicating the success of the payment verification.
 *
 * @throws {Error} - Throws an error if the payment verification fails.
 *
 * @description
 * This controller function verifies the payment by comparing the generated signature with the provided signature.
 * If the verification is successful, it creates a new payment entry in the database. It expects the payment details
 * including the payment ID, order ID, and signature in the request body. The function returns a JSON response indicating
 * the success of the payment verification.
 */
const paymentVerification = tryCatch(async (req, res, next) => {

    // Get user ID from request
    const userId = req.user._id;

    // Check if user is authorized
    if (!userId) {
        let msg = "unauthorized access";
        let err = new AppError(401, msg);
        return next(err);
    }

    // Extract payment details from request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Generate signature for verification
    const body = orderId + "|" + razorpay_payment_id;
    const generated_signature = crypto.createHmac('sha256', 'ggMzScMI6LI4RpKdaudtuVQb')
        .update(body.toString()).digest('hex');

    // Verify signature
    if (generated_signature !== razorpay_signature) {
        let msg = "payment failed";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Create a new payment entry in the database
    const newPayment = await paymentModel.create({
        user: userId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    });

    // Check if payment creation was successful
    if (!newPayment) {
        let msg = "payment failed, try again later";
        let err = new AppError(400, msg);
        return next(err);
    }

    // Send success response
    return res.send("success");
});


module.exports = {
    checkoutController,
    paymentVerification,
    getRazorPayKeyController
}