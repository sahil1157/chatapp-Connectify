import express from "express";
const router = express.Router()
import { registerUser, authUser, getAllUsers } from '../Controllers/Controllers.js'
import { protection } from "../middleware/Protection.js";
import { singleAvatar } from "../middleware/Multer.js";


router.post('/signup', singleAvatar, registerUser)
router.post('/login', authUser)

router.use(protection)
router.get('/chat', protection, getAllUsers)


export default router