import mongoose, { Schema, Types } from "mongoose";

const requestSchema = new Schema({
    status: {
        type: String,
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


export const RequestUser = mongoose.models.Request || mongoose.model("Request", requestSchema)