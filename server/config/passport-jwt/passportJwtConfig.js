const passport = require("passport");
const userModel = require("../../models/userModel/userModel");
const adminModel = require("../../models/adminModel/adminModel");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

/**
 * Passport middleware for JWT authentication.
 * @module passportMiddleware
 */
/**
 * Options for configuring JWT strategy.
 * @type {Object}
 */
let opts = {
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'), // Extract JWT token from URL query parameter
    secretOrKey: 'MdParvez' // Secret key for JWT verification
};

/**
 * Configure JWT strategy for passport authentication.
 */
passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
        try {
            let currentUser;

            // Check if the payload belongs to a user
            const user = await userModel.findOne({ _id: jwt_payload.id });

            // Check if the payload belongs to an admin
            const admin = await adminModel.findOne({ _id: jwt_payload.id });

            if (user) {
                currentUser = user;
                return done(null, currentUser); // Pass user to the next middleware
            }

            if (admin) {
                currentUser = admin;
                return done(null, currentUser); // Pass admin to the next middleware
            }
        } catch (error) {
            done(error, null); // Pass error if any occurs
        }
    })
);
