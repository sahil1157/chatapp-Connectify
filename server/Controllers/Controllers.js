import User from '../Models/UserModels.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import Message from '../Models/MessageModel.js'
import Chat from '../Models/ChatModels.js'

const registerUser = async (req, res, next) => {

    const { firstname, lastname, email, password, gender } = req.body

    try {
        const avatar = req.file

        if (!firstname || !lastname || !email || !password || !gender || !avatar)
            return res.status(404).json({ valid: false, message: 'Please fill out all the fields before submitting' })

        const findEmailIfExist = await User.findOne({ email })
        if (findEmailIfExist) return res.status(400).json({ valid: false, message: "Email already registered" })
        const uploadResult = await cloudinary.uploader.upload(avatar.path);
        const hashPass = await bcrypt.hash(password, 10)
        const createNewUser = await User.create({
            firstname,
            lastname,
            email,
            password: hashPass,
            gender,
            avatar: {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url
            }
        })
        if (createNewUser)
            res.status(200).json({ message: "Success" })

    } catch (error) {
        next({ message: error })
    }

}

const authUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const findEmail = await User.findOne({ email: email });
        if (!findEmail) {
            return res.status(400).json({ valid: false, message: "Invalid email" });
        }

        const getHashedPassword = await bcrypt.compare(password, findEmail.password);
        if (!getHashedPassword) {
            return res.status(400).json({ valid: false, message: "Invalid password" });
        }

        // generating userToken
        const accessToken = jwt.sign({ email: email }, process.env.secretToken, { expiresIn: '2d' });
        const refreshToken = jwt.sign({ email: email }, process.env.secretToken, { expiresIn: '15d' });

        // storing the cookie inside the local storage
        res.cookie("AccessToken", accessToken, { httpOnly: true, sameSite: "None", secure: true, partitioned: true });
        res.cookie("RefreshToken", refreshToken, { httpOnly: true, sameSite: "None", secure: true, partitioned: true });

        return res.status(200).json({ valid: true, message: "Login successful" });

    } catch (err) {
        next({
            message: "Internal server error",
            status: 401
        });
    }
};


// getting all users.
const getAllUsers = async (req, res, next) => {
    const myId = req.user.id
    try {
        const keyword = req.query.search ? {
            $or: [
                { firstname: { $regex: req.query.search, $options: 'i' } },
                { lastname: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ]
        } : {};

        const myDetails = await User.findById(myId).select("avatar.url firstname _id")

        const findUsers = await User.find({
            ...keyword,
            _id: { $ne: req.user.id }
        })

        const userChats = await Chat.find({ members: myId })
            .populate("members", "firstname avatar.url _id")
            .populate({
                path: "latestmessages",
                select: "content sender createdAt",
                populate: {
                    path: "sender",
                    select: "firstname _id avatar.url"
                }
            })

        const chatsWithLatestMessages = userChats.map(x => {
            const membersWithoutMe = x.members.find(member => member._id.toString() !== myId)

            return {
                chat: x._id,
                members: membersWithoutMe ? {
                    _id: membersWithoutMe._id,
                    name: membersWithoutMe.firstname
                } : null,
                latestmessages: x.latestmessages ? {
                    content: x.latestmessages.content,
                    sender: x.latestmessages.sender ? {
                        _id: x.latestmessages.sender._id,
                        firstname: x.latestmessages.sender.firstname,
                        avatar: x.latestmessages.sender.avatar.url
                    } : null,
                    createdAt: x.latestmessages.createdAt
                } : "Be the first to star a conversation"
            }
        })


        res.status(200).json({ findUsers, myId, myDetails, latestMessages: chatsWithLatestMessages });
    } catch (error) {
        next(error);
    }
};


const emitEvent = (req, event, user, data) => {
    // console.log("event", event)
}

const deleteFilesFromCloudinary = async (req, res, next) => {

}




export {
    registerUser,
    authUser,
    getAllUsers,
    emitEvent,
    deleteFilesFromCloudinary
}



