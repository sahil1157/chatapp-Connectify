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
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Register user
    socket.on("REGISTER_USER", ({ userId, chatId }) => {
      if (!userId || !chatId) {
        console.log("Missing userId or chatId in REGISTER_USER");
        return;
      }
      userSocketIDs.set(userId, socket.id);
      socket.join(chatId);
      console.log(`User ${userId} joined chat ${chatId}`);
    });

    // Join room
    socket.on("JOIN_ROOM", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    // Leave room
    socket.on("LEAVE_ROOM", (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });

    // Handle new message
    socket.on(
      "NEW_MESSAGE",
      async ({ message, chatId, userId, currentChatId }) => {
        try {
          console.log("Received NEW_MESSAGE event:", {
            message,
            chatId,
            userId,
            currentChatId,
          });

          if (!message || !chatId || !userId) {
            console.log("Missing required fields:", {
              message,
              chatId,
              userId,
            });
            return;
          }

          const targetChatId = chatId || currentChatId;
          if (!targetChatId) {
            console.log("No chat ID provided");
            return;
          }

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
          let isSpam = false;
          let confidence = null;

          try {
            const res = await axios.post(
              `${FLASK_URL}/predict`,
              {
                message,
                model: "LR",
              },
              {
                timeout: 5000,
              }
            );

            const pythonResponse = res.data;
            isSpam = pythonResponse.spam || false;
            confidence = pythonResponse.confidence || null;
            console.log("Spam detection result:", { isSpam, confidence });
          } catch (flaskError) {
            console.error("Flask API error:", flaskError.message);
            // Continue without spam detection if Flask is down
            isSpam = false;
            confidence = null;
          }

          // 🔹 SAVE MESSAGE
          const newMessage = new Message({
            chat: targetChatId,
            sender: userId,
            content: finalMessage,
            isSpam,
            confidence,
            isBadWord,
            badWordConfidence,
          });

          const savedMessage = await newMessage.save();
          console.log("Message saved:", savedMessage._id);

          // Update latest message in chat
          await Chat.findByIdAndUpdate(targetChatId, {
            latestmessages: savedMessage._id,
          });

          // Emit message to room
          io.to(targetChatId).emit("NEW_MESSAGE", {
            message: savedMessage,
            chatId: targetChatId,
            isSpam,
            isBadWord,
          });

          console.log(`Message emitted to room ${targetChatId}`);

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
              try {
                await Message.findByIdAndUpdate(savedMessage._id, {
                  deleted: true,
                });
                io.to(targetChatId).emit("DELETE_MESSAGE", {
                  messageId: savedMessage._id,
                });
                console.log("Spam message deleted:", savedMessage._id);
              } catch (deleteError) {
                console.error("Error deleting spam message:", deleteError);
              }
            }, 15000);
          }
        } catch (error) {
          console.error("Error handling NEW_MESSAGE:", error);

          // Notify the sender about the error
          const senderSocketId = userSocketIDs.get(userId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("MESSAGE_ERROR", {
              message: "Failed to send message. Please try again.",
            });
          }
        }
      }
    );

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, "Reason:", reason);
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
