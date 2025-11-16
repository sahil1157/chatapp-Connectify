import { Server } from "socket.io";
import Chat from "./Models/ChatModels.js";
import Message from "./Models/MessageModel.js";
import axios from "axios";
import { helperBW } from "../server/Models/helper.js";

const userSocketIDs = new Map();
const FLASK_URL = process.env.FLASK_URL || "http://localhost:5001";

const initializeSocket = (server) => {
  const io = new Server(server, {
    allowEIO3: true,
    transports: ["websocket", "polling"],
    cors: {
      origin: [
        "https://chatapp-connectify.netlify.app",
        "https://chatapp-connectify.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register user
    socket.on("REGISTER_USER", ({ userId, chatId }) => {
      if (!userId || !chatId) return;
      userSocketIDs.set(userId, socket.id);
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Leave room
    socket.on("LEAVE_ROOM", (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });

    // Handle new message
    socket.on("NEW_MESSAGE", async ({ message, chatId, userId }) => {
      try {
        if (!message || !chatId || !userId) return;

        // 🔹 BAD WORD DETECTION
        let isBadWord = false;
        let badWordConfidence = null;
        let finalMessage = message;
        const detectedWords = [];

        helperBW.forEach((bw) => {
          const regex = new RegExp(`\\b${bw.word}\\b`, "gi");
          if (regex.test(finalMessage)) {
            isBadWord = true;
            badWordConfidence = bw.confidence;
            detectedWords.push(bw.word);
            finalMessage = finalMessage.replace(regex, "****");
            console.log("⚠️ BAD WORD DETECTED:", bw.word, "-> censored");
          }
        });

        if (isBadWord && detectedWords.length > 0) {
          const senderSocketId = userSocketIDs.get(userId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("BAD_WORD_DETECTED", {
              message: `Inappropriate words detected and censored!`,
              originalMessage: message,
              badWords: detectedWords,
              confidence: badWordConfidence,
            });
          }
        }

        // 🔹 SPAM DETECTION via Python model
        const res = await axios.post(`${FLASK_URL}/predict`, {
          message,
          model: "LR",
        });

        const pythonResponse = res.data;
        const isSpam = pythonResponse.spam || false;
        const confidence = pythonResponse.confidence || null;

        console.log("NEW MESSAGE ANALYSIS:", { message, isSpam, confidence });

        // 🔹 SAVE MESSAGE
        const newMessage = new Message({
          chat: chatId,
          sender: userId,
          content: finalMessage,
          isSpam,
          confidence,
          isBadWord,
          badWordConfidence,
        });

        const savedMessage = await newMessage.save();

        // Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, {
          latestmessages: savedMessage._id,
        });

        // Emit message to room
        io.to(chatId).emit("NEW_MESSAGE", {
          message: savedMessage,
          chatId,
          isSpam,
          isBadWord,
        });

        // Auto-delete spam after 15 seconds
        if (isSpam) {
          const senderSocketId = userSocketIDs.get(userId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("SPAM_DETECTED", {
              message: "Your message was detected as spam!",
              originalMessage: message,
              confidence,
            });
          }

          setTimeout(async () => {
            await Message.findByIdAndUpdate(savedMessage._id, { deleted: true });
            io.to(chatId).emit("DELETE_MESSAGE", { messageId: savedMessage._id });
          }, 15000);
        }
      } catch (error) {
        console.error("Error handling NEW_MESSAGE:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, socketId] of userSocketIDs.entries()) {
        if (socketId === socket.id) {
          userSocketIDs.delete(userId);
          console.log(`User ${userId} disconnected (Socket: ${socket.id})`);
          break;
        }
      }
    });
  });

  return io;
};

export { initializeSocket, userSocketIDs };
