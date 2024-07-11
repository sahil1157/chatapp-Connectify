
import { NEW_ATTACHMENTS, NEW_MESSAGE_ALERT } from '../Constants/emit.js'
import { anotherUsersAvatar } from '../lib/Helper.js'
import Chat from '../Models/ChatModels.js'
import User from '../Models/UserModels.js'
import { emitEvent } from './Controllers.js'
import Message from '../Models/MessageModel.js'

//for searching users 
const searchUser = async (err, req, res, next) => {

    // getting lists of name from query (URL)
    const { name } = req.query

    return res.status(200).json({ message: name })
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


export { searchUser, groupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, sendAttachments }