const express = require('./config/express');
const app = express();
const http = require('http');
const fs = require('fs');
const cfg = require('./config/config');
const mongoose = require('mongoose');

/**
 * Get port from environment and store in Express.
 */
const port = cfg.host.port;

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: "https://127.0.0.1",
        credentials: true
    }
});

require('./server/routes/socket.js')(io);

// Initialize Cron Jobs
require('./server/crons/cartTimeout.js')();

/**
 * Listen on provided port.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Graceful shutdown function
const shutdown = () => {
    console.log('Gracefully shutting down...');

    server.close(async () => {
        console.log('Closed all HTTP connections');

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Closed MongoDB connection');
        }

        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log(`Server is listening on ${bind}`);
}
