import multer from 'multer'
import path from 'path'


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
})

const uploadAvatar = multer({
    storage:storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})
const singleAvatar = uploadAvatar.single('avatar') // it will get the filename called avatar from the forms and stores ins the desired space. And should work as middleware wherethe forms are going to be submitted.
const attachmentsMulter = uploadAvatar.array("files", 5)
export { singleAvatar, attachmentsMulter }