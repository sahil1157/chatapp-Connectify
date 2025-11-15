import { Server } from "socket.io";
import Chat from "./Models/ChatModels.js";
import Message from "./Models/MessageModel.js";
import axios from "axios";
import { helperBW } from "../server/Models/helper.js";

const userSocketIDs = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    allowEIO3: true,
    transports: ["websocket", "polling"],
    cors: {
      origin: "https://chatapp-connectify.onrender.com",
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Register user
    socket.on("REGISTER_USER", ({ userId, chatId }) => {
      userSocketIDs.set(userId, socket.id);
      socket.join(chatId);
    });

    // Leave room
    socket.on("LEAVE_ROOM", (chatId) => {
      socket.leave(chatId);
    });

    // Handle new message
    socket.on("NEW_MESSAGE", async ({ message, chatId, userId }) => {
      try {
        // 🔹 BAD WORD DETECTION
        let isBadWord = false;
        let badWordConfidence = null;
        let finalMessage = message;

        // Track all bad words detected
        let detectedWords = [];

        // Iterate all bad words
        helperBW.forEach((bw) => {
          // Flexible regex to catch bad words in message
          const regex = new RegExp(`\\b${bw.word}\\b`, "gi");
          if (regex.test(finalMessage)) {
            isBadWord = true;
            badWordConfidence = bw.confidence;
            detectedWords.push(bw.word);

            // Replace all occurrences with ****
            finalMessage = finalMessage.replace(regex, "****");

            console.log(
              "%c⚠️ BAD WORD DETECTED:",
              "color: orange; font-weight: bold;",
              bw.word,
              "-> censored"
            );
          }
        });

        // Emit single toast for all bad words detected
        if (isBadWord && detectedWords.length > 0) {
          const senderSocketId = userSocketIDs.get(userId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("BAD_WORD_DETECTED", {
              message: `Inappropriate words detected and censored!
              )}`,
              originalMessage: message,
              badWords: detectedWords,
              confidence: badWordConfidence,
            });
          }
        }

        // 🔹 SPAM DETECTION via Python model
        const res = await axios.post("http://localhost:5001/predict", {
          message,
          model: "LR",
        });

        const pythonResponse = res.data;
        const isSpam = pythonResponse.spam || false;
        const confidence = pythonResponse.confidence || null;
        const additionalData = pythonResponse.additionalData || {};

        console.log(
          "\n%c===== NEW MESSAGE ANALYSIS =====",
          "color: #00f; font-weight: bold; font-size: 16px"
        );
        console.log(
          "%cOriginal Message:",
          "color: #555; font-weight: bold;",
          message
        );
        console.log(
          "%cSpam Detected:",
          "color: red; font-weight: bold;",
          isSpam
        );
        console.log(
          "%cSpam Confidence:",
          "color: orange; font-weight: bold;",
          confidence
        );
        console.log(
          "%cAdditional Data:",
          "color: green; font-weight: bold;",
          additionalData
        );
        console.log(
          "%c===============================\n",
          "color: #00f; font-weight: bold;"
        );

        // 🔹 SAVE MESSAGE
        const createNewMessage = new Message({
          chat: chatId,
          sender: userId,
          content: finalMessage,
          isSpam,
          confidence,
          isBadWord,
          badWordConfidence,
        });

        const savedMessage = await createNewMessage.save();

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
            await Message.findByIdAndUpdate(savedMessage._id, {
              deleted: true,
            });
            io.to(chatId).emit("DELETE_MESSAGE", {
              messageId: savedMessage._id,
            });
          }, 15000);
        }
      } catch (error) {
        console.error(
          "%cError handling NEW_MESSAGE:",
          "color: red; font-weight: bold;",
          error
        );
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
