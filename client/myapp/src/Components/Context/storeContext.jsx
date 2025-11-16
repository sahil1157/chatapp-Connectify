import { createContext, useEffect, useMemo, useState, useRef } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'

export const storeContext = createContext(null)

const StoreContextProvider = (props) => {
    const navigate = useNavigate()
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
    const [spam, setSpam] = useState('')

    const api = axios.create({
        baseURL: 'https://chatapp-connectify.onrender.com',
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

    // -------------------------------------------------------
    //                SOCKET FIX (ONLY CHANGE)
    // -------------------------------------------------------
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io("https://chatapp-connectify.onrender.com", {
                transports: ["websocket"],
                withCredentials: true,
            });
            setSocket(socketRef.current);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);
    // -------------------------------------------------------

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socket) return; // socket not ready yet

        function onDisconnect() {
            setIsConnected(false);
        }

        const handleConnect = () => {
            if (myId && currUser.chatId) {
                socket.emit("REGISTER_USER", { userId: myId, chatId: currUser.chatId });
                setIsConnected(true);
            }
        };

        const handleNewMessage = (data) => {
            setStoreUSerMessage((prevMessages) => [...prevMessages, data]);
            setCheck(false);
        };

        const handleSpamDetected = (data) => {
            const { message, originalMessage } = data;

            setCheck(false);

            toast.error(message || "Spam message detected!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });

            console.warn("Spam blocked:", originalMessage);
        };

        const handleDeleteMessage = ({ messageId }) => {
            setStoreUSerMessage(prevMessages =>
                prevMessages.map(msg =>
                    msg.message._id === messageId ? { ...msg, deleted: true } : msg
                )
            );
        };

        socket.on("BAD_WORD_DETECTED", (data) => {
            toast.error(data.message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });

            console.log("Bad word detected:", data);
        });

        socket.on("connect", handleConnect);
        socket.on("NEW_MESSAGE", handleNewMessage);
        socket.on("DELETE_MESSAGE", handleDeleteMessage);
        socket.on('disconnect', onDisconnect);
        socket.on('SPAM_DETECTED', handleSpamDetected);

        if (messages) {
            socket.emit("JOIN_ROOM", messages);
            setCurrentUserId(messages);
        }

        return () => {
            socket.off("NEW_MESSAGE", handleNewMessage);
            socket.off("DELETE_MESSAGE", handleDeleteMessage);
            socket.off("BAD_WORD_DETECTED")
            socket.off('disconnect', onDisconnect);
            socket.off("connect", handleConnect);
        };
    }, [socket, messages, myId, currUser.chatId]);

    useEffect(() => {
        setStoreUSerMessage([])
    }, [messages])

    const sendMessage = (message, chatId, userId) => {
        setCurrentUserId(userId)
        setCheck(true)
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
                console.log(error)
                setLoading(false)
            }
        };

        if (messages) {
            sendId();
        }
    }, [messages]);

    const [search, setSearch] = useState("")
    const [searchedUsers, setSearchedUsers] = useState(users?.findUsers)

    useEffect(() => {
        if (users && users.findUsers) {
            if (search.length > 0) {
                const findUsers = users?.findUsers?.filter(x =>
                    x.firstname.toLowerCase().includes(search.toLowerCase())
                )
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
