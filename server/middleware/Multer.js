import multer from 'multer'

const uploadAvatar = multer({
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})
const singleAvatar = uploadAvatar.single('avatar') // it will get the filename called avatar from the forms and stores ins the desired space. And should work as middleware wherethe forms are going to be submitted.
const attachmentsMulter = uploadAvatar.array("files", 5)
export { singleAvatar, attachmentsMulter }