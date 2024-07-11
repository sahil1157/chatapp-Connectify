import express from 'express'
import { protection } from '../middleware/Protection.js'
import { groupChat, searchUser, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, sendAttachments } from '../Controllers/ChatControllers.js'
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
// router.get('/', protection, fetchChats)
// router.post('/group', protection, createGroupChat)
// router.put('/remove', protection, removeFromGroup)
// router.put('/add', protection, addToGroup)

export default chatRoutes