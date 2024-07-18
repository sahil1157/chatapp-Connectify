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
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./Constants/emit.js";
import { v4 as uuid } from 'uuid'
import { getSockets } from "./lib/Helper.js";

dotenv.config();
connectDB();

// Initializing Express app
const app = express();
const port = process.env.PORT || 5000;
const server = createServer(app);
const userSocketIDs = new Map()

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
    const tempUser = {
        _id: "aezakmi",
        name: "kya bolti publich"
    }
    userSocketIDs.set(tempUser._id.toString(), socket.id)
    console.log(userSocketIDs)
    console.log(colors.yellow(`A user connected: ${socket.id}`));

    socket.emit("welcome", colors.cyan(`Welcome, ${socket.id}`));

    socket.on(NEW_MESSAGE, async ({ chatId, message, members }) => {

        const messageForRealTime = {
            content: message,
            _id: uuid(),
            sender: {
                _id: tempUser._id,
                name: tempUser.name
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        }

        console.log(messageForRealTime)

      const  messageForDb = {
            content: message,
            sender: tempUser._id,
            chat:chatId
        }
        // a helper function thahelps to retrieve SocketIds for the given user which is stored in the userSocketIDs..
        const userSocket = getSockets(members)
        
        io.to(userSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
        })
        io.to(userSocket).emit(NEW_MESSAGE_ALERT, {
            chatId
        })
        console.log(userSocket)
    })


    socket.on("disconnect", () => {
        console.log(colors.red(`A user disconnected: ${socket.id}`))
        userSocketIDs.delete(tempUser._id.toString())
    })
});

// Error middleware
app.use(errorMiddleware);
// Start server
server.listen(port, () => {
    console.log(colors.red.bold(`Server is running on port ${port}`));
});


export {
    userSocketIDs
}