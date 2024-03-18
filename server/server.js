const http = require('http');
const app = require('./app');

// Get the port from the environment variables
const PORT = process.env.PORT;

// Create an HTTP server using the Express application
const server = http.createServer(app);

// Start the server and listen on the specified port
server.listen(PORT, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server is listening on PORT ${PORT}`);
    }
});
