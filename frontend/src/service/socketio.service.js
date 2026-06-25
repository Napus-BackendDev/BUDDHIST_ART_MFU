import { io } from 'socket.io-client';
class SocketioService {
    socket;
    constructor() {}

    setupSocketConnection() {
        // Connect to the same backend the REST API uses (falls back to localhost in dev).
        const url = process.env.VUE_APP_API_URL || "http://127.0.0.1:8081";
        this.socket = io(url, { transports: ["websocket", "polling"] });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }


// io.on('connection', (socket) => {
//     console.log('a user connected');
//
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });
//
//     socket.on('my message', (msg) => {
//         console.log('message: ' + msg);
//     });
// });

}



export default new SocketioService();
