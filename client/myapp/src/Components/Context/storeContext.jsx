import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client'

export const storeContext = createContext(null)

const StoreContextProvider = (props) => {
    const navigate = useNavigate()
    // getting messages of the user which i've clicked
    const [messages, getMessages] = useState('')
    const [userMessage, setUserMessage] = useState()
    const [loggedIn, setLoggedIn] = useState(false)
    const [check, setCheck] = useState(false)
    const [currUser, setCurrUser] = useState({})
    const [loading, setLoading] = useState(false)
    const [myId, setMyId] = useState()
    const [storeUserMessage, setStoreUSerMessage] = useState([])
    const userId = myId
    const [CurrentUserId, setCurrentUserId] = useState()
    const [myDetails, setMydetails] = useState()
    const [latestDatas, setLatestDatas] = useState()
    const [authLoading, setAuthLoading] = useState(true)

    const api = axios.create({
        baseURL: 'https://chatapp-connectify-c9k4.onrender.com',
        // baseURL: 'http://localhost:5000',
        withCredentials: true
    })
    useEffect(() => {
        const checkUserAuth = async () => {
            try {
                const checkAuth = await api.get("/chat")
                if (checkAuth)
                    return setAuthLoading(false)
            } catch (error) {
                setAuthLoading(false)
                return navigate("/login")
            }
        }
        checkUserAuth()
    }, [])

    const handleNewMessage = (data) => {
        setStoreUSerMessage(x => [...x, data])
        setCheck(true)
    }
    // routes for getting the users...
    const [users, getUsers] = useState([])

    useEffect(() => {
        const fetchApi = async () => {
            try {
                await api.get("/chat")
                    .then(x => {
                        getUsers(x.data)
                        setMydetails(x.data.myDetails)
                        setLatestDatas(x.data)
                        setMyId(x.data.myId)
                    })
            } catch (error) {
                console.log(error)
            }
        }
        fetchApi()
    }, [currUser, loggedIn, userMessage])

    // Implementing socketio....

    const socket = io('https://chatapp-connectify-c9k4.onrender.com', {
        withCredentials: true,
        transports: ['websocket'],
    });
    // const socket = io('http://localhost:5000/')

    useEffect(() => {
        const handleConnect = () => {
            if (myId && messages) {
                socket.emit("REGISTER_USER", { userId: myId, chatId: currUser.chatId })
            }
        }

        if (CurrentUserId) {
            socket.on("LEAVE_ROOM", CurrentUserId)
        }

        socket.on("connect", handleConnect)
        socket.on("NEW_MESSAGE", handleNewMessage)

        return () => {
            if (messages) {
                socket.emit("JOIN_ROOM", messages)
                // setCurrentUserId(messages)
            }
            socket.off("NEW_MESSAGE", handleNewMessage);
            socket.off("connect", handleConnect);
        };

    }, [socket, messages, myId, currUser?.chatId, CurrentUserId])


    useEffect(() => {
        // this is to clear the user's messages recieved so that duplicate datas wont appear
        setStoreUSerMessage([])
    }, [messages])


    const sendMessage = (message, chatId, userId) => {
        setCurrentUserId(userId)
        if (socket) {
            socket.emit("NEW_MESSAGE", { message, chatId, userId, messages })
            setUserMessage(message)

        }
    }

    useEffect(() => {
        if (!messages)
            return console.log('no users')
        const sendId = async () => {
            try {
                setLoading(true)
                const response = await api.post("chat/mymessages/", { userId: messages });
                const { text, details, chatId, message, currUserId } = response.data
                setCurrUser(
                    {
                        details,
                        chatId,
                        text,
                        userId: currUserId,
                        message
                    }
                )
                setLoading(false)
            } catch (error) {
                // console.error('Error:', error.response ? error.response.data : error.message);
                setLoading(false)
            }
        };

        if (messages) {
            sendId();
        }
    }, [messages]);

    // search functionality using fetched users
    const [search, setSearch] = useState("")
    const [searchedUsers, setSearchedUsers] = useState(users?.findUsers)

    useEffect(() => {

        if (users && users.findUsers) {
            if (search.length > 0) {
                const findUsers = users?.findUsers?.filter(x => x.firstname.toLowerCase().includes(search.toString().toLowerCase()))
                return setSearchedUsers(findUsers)
            }
            else {
                setSearchedUsers(users.findUsers)
            }
        }

    }, [search, users])

    const contextValue = {
        api,
        sendMessage,
        getUsers,
        users,
        getMessages,
        currUser,
        loading,
        userId,
        storeUserMessage,
        setStoreUSerMessage,
        setCurrentUserId,
        setCheck,
        check,
        socket,
        myDetails,
        latestDatas,
        setLoggedIn,
        setSearch,
        searchedUsers,
        authLoading,
        CurrentUserId


    }

    return <storeContext.Provider value={contextValue}>
        {props.children}
    </storeContext.Provider>
}

export default StoreContextProvider