import User from "../Models/UserModels.js"
import Chat from '../Models/ChatModels.js'
import { faker, simpleFaker } from '@faker-js/faker'

const createSignleChats = async (chatscount) => {

    try {

        const users = await User.find().select("_id")
        const chatPromise = []
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [users[i], users[j]]
                    })
                )
            }
        }
        await Promise.all(chatPromise)
        console.log("Chats created successfully")

    } catch (error) {
        return res.status(400).json({ error })

    }
}

export { createSignleChats }