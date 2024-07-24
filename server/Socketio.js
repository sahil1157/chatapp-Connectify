import { Server, Socket } from "socket.io";
import colors from 'colors';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./Constants/emit.js";
import { v4 as uuid } from 'uuid';
import { getSockets } from "./lib/Helper.js";
import Chat from "./Models/ChatModels.js";
import Message from "./Models/MessageModel.js";

const userSocketIDs = new Map();

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT'],
            credentials: true
        }
    });

    // io.on('connection', (socket) => {
    //     const tempUser = {
    //         _id: "aezakmi",
    //         name: "kya bolti publich"
    //     };
    //     userSocketIDs.set(tempUser._id.toString(), socket.id);
    //     console.log(userSocketIDs);
    //     console.log(colors.yellow(`A user connected: ${socket.id}`));

    //     socket.emit("welcome", colors.cyan(`Welcome, ${socket.id}`));

    //     socket.on(NEW_MESSAGE, async ({ chatId, message, members }) => {
    //         const messageForRealTime = {
    //             content: message,
    //             _id: uuid(),
    //             sender: {
    //                 _id: tempUser._id,
    //                 name: tempUser.name
    //             },
    //             chat: chatId,
    //             createdAt: new Date().toISOString()
    //         };

    //         console.log(messageForRealTime);

    //         const messageForDb = {
    //             content: message,
    //             sender: tempUser._id,
    //             chat: chatId
    //         };
    //         // a helper function that helps to retrieve SocketIds for the given user which is stored in the userSocketIDs..
    //         const userSocket = getSockets(members);

    //         io.to(userSocket).emit(NEW_MESSAGE, {
    //             chatId,
    //             message: messageForRealTime
    //         });
    //         io.to(userSocket).emit(NEW_MESSAGE_ALERT, {
    //             chatId
    //         });
    //         console.log(userSocket);
    //     });

    //     socket.on("disconnect", () => {
    //         console.log(colors.red(`A user disconnected: ${socket.id}`));
    //         userSocketIDs.delete(tempUser._id.toString());
    //     });
    // });
    io.on("connection", (Socket) => {

        Socket.on("REGISTER_USER", ({ userId, chatId }) => {
            userSocketIDs.set(userId, Socket.id)
            Socket.join(chatId)
        })

        Socket.on("LEAVE_ROOM", (chatId) => {
            console.log(`${Socket.id} left the chat/room ${chatId}`)
            Socket.leave(chatId)
        })


        Socket.on("NEW_MESSAGE", async ({ message, chatId, userId }) => {
            const findChat = await Chat.findById([chatId])
            if (!findChat) {
                return console.log("chat not found")
            }


            // creating a new message
            const createNewMessage = new Message({
                chat: chatId,
                sender: userId,
                content: message

            })
            await createNewMessage.save()
            // emitting the message that was creating

            io.to(chatId).emit("NEW_MESSAGE", {
                message: createNewMessage,
                chatId
            })

        });
        Socket.on('disconnect', () => {
            // console.log('A user disconnected:', Socket.id);
            // Optionally, remove the socket ID from userSocketIDs here
        });
    });

    return io;
};

export {
    initializeSocket,
    userSocketIDs
};
