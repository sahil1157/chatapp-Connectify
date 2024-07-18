import express from 'express'
import { protection } from '../middleware/Protection.js'
import {
    groupChat,
    searchUser,
    getMyChats,
    getMyGroups,
    addMembers,
    removeMembers,
    leaveGroup,
    sendAttachments,
    getChatDetails,
    renameGroup,
    deleteChat,
    getMessages,
    sendRequest,
    acceptRequest,
    getAllNotification
} from '../Controllers/ChatControllers.js'
import { attachmentsMulter } from '../middleware/Multer.js'

const chatRoutes = express()

chatRoutes.use(protection)
chatRoutes.get('/search', searchUser)
chatRoutes.post('/new', groupChat)
chatRoutes.get('/mychats', getMyChats)
chatRoutes.get('/mygroupchats', getMyGroups)
chatRoutes.put('/addmembers', addMembers)
chatRoutes.put('/removemembers', removeMembers)
chatRoutes.put('/leaveGroup/:id', leaveGroup)
chatRoutes.post('/message', attachmentsMulter, sendAttachments)
chatRoutes.get("/message/:id", getMessages)
chatRoutes.put("/sendrequest", sendRequest)
chatRoutes.put("/acceptrequest", acceptRequest)
chatRoutes.get("/notification", getAllNotification)

// getting chat details,rename,delete...
chatRoutes.route("/:id").get(getChatDetails).put(renameGroup).delete(deleteChat)

export default chatRoutes