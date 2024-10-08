
import { NEW_ATTACHMENTS, NEW_MESSAGE_ALERT, REFETCH_CHATS } from '../Constants/emit.js'
import { anotherUsersAvatar } from '../lib/Helper.js'
import Chat from '../Models/ChatModels.js'
import User from '../Models/UserModels.js'
import { deleteFilesFromCloudinary, emitEvent } from './Controllers.js'
import Message from '../Models/MessageModel.js'
import { RequestUser } from '../Models/Request.js'


// getting my messages

const myMessages = async (req, res, next) => {
    const { userId } = req.body
    const myId = req.user._id.toString()

    try {

        if (!userId || !myId)
            return res.status(200).json({ message: "No datas found, please try again later" })

        const findUserFromId = await User.findById(userId).select("firstname lastname avatar.url")
        const findMyDetails = await User.findById(myId).select("firstname")

        const chat = await Chat.findOne({
            isgroupchat: false,
            members: { $all: [userId, myId] }
        })

        if (!chat) {
            const newchat = await new Chat({
                name: `${findMyDetails.firstname} - ${findUserFromId.firstname}`,
                isgroupchat: false,
                members: [myId, userId]

            })
            await newchat.save()
            return res.status(200).json({
                details: findUserFromId,
                chatId: newchat._id,
                currUserId: userId,
                text: "New message created, be the first one to text"

            })
        }

        const messages = await Message.find({ chat: chat._id.toString() })
            .populate("sender", "firstname lastname avatar.url")
            .populate("chat")

        if (messages.length === 0 || messages.length < 0) {
            return res.status(200).json({
                text: "No messages found, You can start the new conversation",
                chatId: chat._id,
                details: findUserFromId,
                currUserId: userId

            })
        }
        else {
            res.status(200).json({ text: "", message: messages, valid: true, currUserId: userId, chatId: chat._id, details: findUserFromId })
        }

    } catch (error) {
        next({
            message: error
        })
    }
}



//for searching users 
const searchUser = async (req, res, next) => {

    // getting lists of name from query (URL)
    const { name } = req.query
    try {

        const chat = await Chat.find({
            isgroupchat: false,
            members: req.user._id
        })
        // getting users with whom i have chatted with
        const allUsersFromMyChats = chat.map((x) => x.members).flat()
        return res.status(200).json({ message: allUsersFromMyChats })

    } catch (error) {
        return next({
            message: error
        })
    }
}

// getting groupchats
const groupChat = async (req, res, next) => {
    const { name, members } = req.body

    try {

        if (members.length < 2)
            return next({
                message: "Members should be greater than 2"
            })

        const allMembers = [...members, req.user]

        await Chat.create({
            name,
            isgroupchat: true,
            groupadmin: req.user,
            members: allMembers,

        })

        // emitEvent(ALERT, allMembers, `Welcome to ${name} group chat`)
        // emitEvent(req, REFETCH_CHATS, members)


        return res.status(201).json({ valid: true, message: "Group chat created" })

    } catch (error) {
        return next(error)
    }
}


//my group chats
const getMyChats = async (req, res, next) => {

    try {
        const chats = await Chat.find({ members: req.user._id })
            .populate("members",
                "firstname avatar")

        const transformedChats = chats.map(({ isgroupchat, name, members, _id }) => {
            const otherUser = anotherUsersAvatar(members, req.user)
            const member = members.filter((x) => {
                return (x._id.toString() !== req.user._id.toString())
            })
            const findIds = member.map((x) => x._id)

            return {
                avatar: isgroupchat ? members.slice(0, 3).map(({ avatar }) => {
                    return avatar.url
                }) : [otherUser.avatar.url],
                _id: _id,
                isgroupchat,
                members: findIds,
                name: isgroupchat ? name : otherUser.name,

            }
        })
        return res.status(200).json({ transformedChats })

    } catch (error) {
        next({
            message: error
        })
    }
}

// getting groups created by me
const getMyGroups = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            members: req.user._id,
            isgroupchat: true,
            groupadmin: req.user._id
        }).populate("members", "name avatar")


        const transformedChats = chats.map(({ _id, name, members, isgroupchat }) => ({
            _id,
            name,
            isgroupchat,
            avatar: members.slice(0, 3).map(({ avatar }) => avatar.url)

        }))

        res.status(200).json({ message: transformedChats })

    } catch (error) {
        next({
            message: error
        })
    }
}

const addMembers = async (req, res, next) => {
    const { chatId, member } = req.body
    try {
        if (member.length < 1) return next({
            message: "Select users to add"
        })

        const findChatId = await Chat.findById(chatId)
        const memberId = member.map(x => x.toString())
        const findId = findChatId.members.map(x => x.toString())

        const members = memberId.filter(x => !findId.includes(x))

        if (members.length < 1) return next({
            message: "Selected users are already in the Group",
            status: 404
        })

        if (!findChatId.isgroupchat) return next({
            message: "This is not a Group Chat"
        })

        if (findChatId.groupadmin.toString() !== req.user._id.toString()) return next({
            message: "This operation can only be performed by Admin"
        })

        const getAllNewUsersPromise = members.map(x => User.findById(x, "firstname"))

        const getAllNewUsers = await Promise.all(getAllNewUsersPromise)

        findChatId.members.push(...getAllNewUsers.map(x => x._id))
        await findChatId.save()

        const getNames = getAllNewUsers.map(x => x.firstname).join(",")

        // console.log(`${getNames} has been added by ${req.user.firstname} `)


        res.status(200).json({ findChatId })
    } catch (error) {
        return next({
            message: error
        })
    }


}


const removeMembers = async (req, res, next) => {
    const { userId, chatId } = req.body

    try {
        const findId = await Chat.findById(chatId)

        if (!findId.isgroupchat) return next({
            message: "This is not a groupchat"
        })

        if (findId.groupadmin.toString() !== req.user._id.toString()) return next({
            message: "This action can only be performed by Group Admin",
            status: 403
        })


        const confirmUsers = findId.members.filter(x => userId.includes(x.toString()))
        if (confirmUsers.length === 0 || confirmUsers < 1) return next({
            message: "Users not found"
        })

        const deleteItems = findId.members.filter(x => !userId.includes(x.toString()))
        findId.members = deleteItems
        await findId.save()

        res.status(200).json({ findId })

    } catch (error) {
        return next({
            message: error
        })
    }

}


const leaveGroup = async (req, res, next) => {
    const chatId = req.params.id.toString()

    try {
        const findId = await Chat.findById(chatId)

        if (!findId) return next({
            message: "Server error, please try again"
        })

        const findRemUsers = findId.members.filter(x => x.toString() !== req.user._id.toString())

        if (findId.groupadmin.toString() === req.user._id.toString()) {
            if (findRemUsers.length > 0) {
                findId.groupadmin = findRemUsers[0]
            }
            else {
                return next({
                    message: "Group admin cannot leave the group when only one member is left"
                })
            }
        }

        findId.members = findRemUsers

        await findId.save()

        return res.status(200).json({ findId })
    } catch (error) {
        return next({
            message: error
        })
    }
}


// attachments 

const sendAttachments = async (req, res, next) => {

    const { chatId } = req.body

    if (!chatId) return next({
        message: "Chatid not found"
    })

    try {

        const [chat, me] = await Promise.all([
            Chat.findById(chatId),
            User.findById(req.user._id.toString(), "firstname")
        ])

        if (!chat) return next({
            message: "Chat not found",
            status: 404
        })

        const file = req.files || []

        if (file.length < 1) return next({
            message: "Please provide attachments",
            status: 404
        })

        // upload files here....
        const attachments = []

        const messageForDb = {
            content: "",
            attachments,
            sender: me._id,
            chat: chatId
        }


        const messageForRealTime = {
            ...messageForDb,
            sender: {
                name: me.firstname,
                id: me._id,
                chat: chatId
            },
        }

        const message = await Message.create(messageForDb)

        emitEvent(req, NEW_ATTACHMENTS, chat.members, {
            message: messageForRealTime,
            chatId
        })

        emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
            chatId
        })
        res.status(200).json({ message: message })

    } catch (error) {
        return next({
            message: error
        })
    }
}

// getting chat details..

const getChatDetails = async (req, res, next) => {

    if (req.query.populate === "true") {

        const chat = await Chat.findById(req.params.id).populate("members", "avatar firstname").lean()

        if (!chat) return next({
            message: "Chat not found",
            status: 404
        })
        chat.members = chat.members.map(({ _id, avatar, firstname }) => {
            return {
                _id,
                avatar: avatar.url,
                firstname
            }
        })

        return res.status(200).json({ chat })
    }
    else {

        const chat = await Chat.findById(req.params.id)
        if (!chat) return next({
            message: "chat not found"
        })

        res.status(200).json({ chat })

    }
}

const renameGroup = async (req, res, next) => {
    const chatId = req.params.id
    const { name } = req.body
    console.log(req.user._id)

    try {
        const chat = await Chat.findById(chatId)
        console.log(chat)

        if (!chat) return next({
            message: "Chat not found",
            status: 404
        })

        if (!chat.isgroupchat) return next({
            message: "This action cannot be performed",
            status: 403
        })

        if (chat.groupadmin.toString() !== req.user._id.toString())
            return next({
                message: "This action can be performed by Admin only",
                status: 403
            })

        chat.name = name
        await chat.save()

        emitEvent(req, REFETCH_CHATS, chat.member)

        res.status(200).json({ chat })
    } catch (error) {
        return next({
            message: error
        })
    }
}

// delete chats from both group and private

const deleteChat = async (req, res, next) => {

    const chatId = req.params.id

    try {
        const chat = await Chat.findById(chatId)

        if (!chatId) return next({
            message: "Chat was not found",
            status: 404
        })

        if (chat.isgroupchat && chat.groupadmin.toString() !== req.user._id.toString()) return next({
            message: "This action can only be performed by Admin only",
            status: 403
        })

        // deleting message and attacgments from the cloudinary

        const messageWithAttachments = await Message.find({
            chat: chatId,
            attachments: { $exists: true, $ne: [] }
        })
        const public_ids = []

        messageWithAttachments.forEach(({ attachments }) => {
            attachments.forEach(({ public_id }) => {
                public_ids.push(public_id)
            })
        })
        await Promise.all(
            [
                deleteFilesFromCloudinary(public_ids),
                chat.deleteOne(),
                Message.deleteMany({ chat: chatId })
            ])

        await chat.save()

        return res.status(200).json({ message: chat })

    } catch (error) {
        return next({
            message: error
        })
    }


}

// getting messages
const getMessages = async (req, res, next) => {
    const chatId = req.params.id
    try {
        const chat = await Chat.findById()
        const { page = 1 } = req.query
        const perpage = 20

        const skip = (page - 1) * perpage

        const [messages, totalMessagesCount] = await promise.all([
            Message.find({ chat: chatId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(perpage)
                .populate("sender", "firstname avatar")
                .lean(),
            Message.countDocuments({ chat: chat })
        ])

        const totalPages = Math.ceil(totalMessagesCount / perpage)


        return res.status(200).json({ message: messages, totalPages })
    } catch (error) {
        return next({
            message: error
        })
    }

}

// sending request
const sendRequest = async (req, res, next) => {
    const { recieverId } = req.body

    if (!recieverId) return next({
        message: "Internal server error, Please try again later"
    })

    try {
        const findReq = await RequestUser.findOne({
            $or: [
                { sender: req.user._id, reciever: recieverId },
                { sender: recieverId, reciever: req.user._id },
            ]
        })

        if (findReq) return next({
            message: "Request already sent"
        })


        await RequestUser.create({
            sender: req.user._id,
            reciever: recieverId
        })

        return res.status(200).json({ success: true, message: "Friend request sent successfylly", findReq })
    } catch (error) {
        return next({
            message: error
        })
    }
}

// accept request
const acceptRequest = async (req, res, next) => {
    const { RequestId, accept } = req.body

    try {
        if (!RequestId) return next({
            message: "User not found, please try again later"
        })

        const findId = await RequestUser.findById(RequestId)
            .populate("sender", "firstname")
            .populate("reciever", "firstname")

        if (!findId) return next({
            message: "No request was found, please try again later"
        })
        if (findId.reciever._id.toString() !== req.user._id.toString()) return next({
            message: "This action cannot be performed by unauthorized user",
            status: 401
        })

        if (!accept) {
            await findId.deleteOne()
            return res.status(400).json({ message: "rejected " })
        }

        const members = [findId.sender._id, findId.reciever._id]
        console.log(findId.sender._id)

        await Promise.all(
            [
                Chat.create({
                    members,
                    name: `${findId.sender.name}-${findId.reciever.name}`
                }),
                findId.deleteOne()
            ]
        )

        return res.status(200).json({ success: true, message: "Accepted", Chat })
    }
    catch (error) {
        return next({
            message: error
        })
    }
}

// get all notification

const getAllNotification = async (req, res, next) => {
    try {

        const findRequests = await RequestUser.find({ reciever: req.user._id })
            .populate("sender", "firstname avatar")

        const allUser = findRequests.map(({ firstname, sender, _id }) => {
            return {
                _id,
                firstname: sender.firstname,
                avatar: sender.avatar.url
            }
        })
        // console.log(allUser)

        return res.status(200).json({ allUser })
    }
    catch (error) {
        return next({
            message: error
        })
    }
}

export {
    searchUser,
    groupChat,
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
    getAllNotification,
    myMessages
}