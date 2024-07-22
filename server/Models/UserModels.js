import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    avatar: {
        public_id: {
            type: String,
            // required: true
        },
        url: {
            type: String,
            // required: true
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        require: true,

    },
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User