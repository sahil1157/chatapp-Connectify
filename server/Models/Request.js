import { Schema, Types } from "mongoose";

const requestSchema = new Schema({
    status: {
        default: "pending",
        enum: ["pending", "accepted", "rejected"]
    },
    sender: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    reciever: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
}, {
    timestamps: true
})


export const request = mongoose.models.request || mongoose.models("Request", requestSchema)