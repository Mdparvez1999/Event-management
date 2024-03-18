const multer = require("multer");

/**
 * Multer middleware configuration for handling file uploads.
 * @module multerConfig
 */
/**
 * Disk storage settings for Multer to define how files should be stored.
 * @type {Object}
 */
const storage = multer.diskStorage({
    /**
     * Function to specify the destination directory for storing uploaded files.
     * @param {Object} req - Express request object.
     * @param {Object} file - Uploaded file object.
     * @param {Function} cb - Callback function to return the destination path.
     */
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Set destination folder for uploads
    },
    /**
     * Function to specify the filename for storing uploaded files.
     * @param {Object} req - Express request object.
     * @param {Object} file - Uploaded file object.
     * @param {Function} cb - Callback function to return the filename.
     */
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname); // Append unique timestamp to filename
    }
});

/**
 * Multer middleware configuration with custom storage settings.
 * @type {Object}
 */
const upload = multer({ storage: storage });

module.exports = upload;
