import express from "express";
const router = express.Router()
import { registerUser, authUser, getAllUsers, Logout } from '../Controllers/Controllers.js'
import { protection } from "../middleware/Protection.js";
import { singleAvatar } from "../middleware/Multer.js";


router.post('/signup', singleAvatar, registerUser)
router.post('/login', authUser)

router.use(protection)
router.get('/chat', protection, getAllUsers)
router.post('/logout', protection, Logout)


export default router