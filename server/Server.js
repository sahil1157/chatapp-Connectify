import express from "express";
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./Config/db.js";
import router from './Routes/Routing.js';
import errorMiddleware from "./middleware/error-middleware.js";
import cookieParser from 'cookie-parser';
import chatRoutes from "./Routes/chatRoutes.js";
import bodyParser from "body-parser";
import colors from 'colors';

dotenv.config();
connectDB();

// Initializing Express app
const app = express();
const port = process.env.PORT || 5000;
const server = createServer(app);

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Router middleware
app.use('/', router);
app.use("/chat", chatRoutes);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT'],
        credentials: true
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(colors.yellow(`A user connected: ${socket.id}`));
    socket.emit("welcome", colors.cyan(`Welcome, ${socket.id}`));
});

// Error middleware
app.use(errorMiddleware);

// Start server
server.listen(port, () => {
    console.log(colors.red.bold(`Server is running on port ${port}`));
});
