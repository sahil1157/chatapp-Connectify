import mongoose from "mongoose";

const chatModels = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    isgroupchat: {
        type: Boolean,
        default: false
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    latestmessages: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupadmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }
}, {
    timestamps: true
})

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatModels)

export default Chat