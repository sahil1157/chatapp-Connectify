import User from '../Models/UserModels.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, gender, avatar } = req.body

    if (!firstname || !lastname || !email || !password || !gender)
        return res.status(404).json({ valid: false, message: 'Please fill out all the fields before submitting' })

    const findEmailIfExist = await User.findOne({ email })
    if (findEmailIfExist) return res.status(400).json({ valid: false, message: "Email already registered" })

    const hashPass = await bcrypt.hash(password, 10)
    const createNewUser = await User.create({
        firstname,
        lastname,
        email,
        password: hashPass,
        gender,
        avatar
    })

    if (createNewUser) res.status(200).json({ valid: true, message: "User successfully created" })

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
        next(err);
    }
};


// getting all users.
const getAllUsers = async (req, res, next) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { firstname: { $regex: req.query.search, $options: 'i' } },
                { lastname: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ]
        } : {};

        const findUsers = await User.find({
            ...keyword,
            _id: { $ne: req.user._id }
        });
        res.status(200).json(findUsers);
    } catch (error) {
        next(error);
    }
};


const emitEvent = (req, event, user, data) => {
    console.log("event", event)
}

const deleteFilesFromCloudinary = async(req, res, next) => {

}




export {
    registerUser,
    authUser,
    getAllUsers,
    emitEvent, 
    deleteFilesFromCloudinary
}



