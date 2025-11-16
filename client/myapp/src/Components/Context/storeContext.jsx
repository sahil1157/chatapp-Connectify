import { createContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
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
                console.log("Error fetching users:", error)
            }
        }
        fetchApi()
    }, [currUser, loggedIn, userMessage])

    // -------------------------------------------------------
    //                IMPROVED SOCKET SETUP
    // -------------------------------------------------------
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only create socket if not exists and we have the URL
        if (!socketRef.current) {
            console.log("Initializing socket connection...");
            socketRef.current = io("https://chatapp-connectify.onrender.com", {
                transports: ["websocket", "polling"],
                withCredentials: true,
                timeout: 10000,
                forceNew: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });
            setSocket(socketRef.current);
        }

        const currentSocket = socketRef.current;

        // Connection events
        currentSocket.on("connect", () => {
            console.log("Socket connected:", currentSocket.id);
            setIsConnected(true);

            // Register user after connection is established
            if (myId && currUser.chatId) {
                currentSocket.emit("REGISTER_USER", {
                    userId: myId,
                    chatId: currUser.chatId
                });
            }
        });

        currentSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        });

        currentSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            setIsConnected(false);
        });

        // Message events
        currentSocket.on("NEW_MESSAGE", (data) => {
            console.log("New message received:", data);
            setStoreUSerMessage((prevMessages) => [...prevMessages, data]);
            setCheck(false);
        });

        currentSocket.on("SPAM_DETECTED", (data) => {
            console.log("Spam detected:", data);
            setCheck(false);
            toast.error(data.message || "Spam message detected!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored"
            });
        });

        currentSocket.on("BAD_WORD_DETECTED", (data) => {
            console.log("Bad word detected:", data);
            toast.error(data.message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        });

        currentSocket.on("DELETE_MESSAGE", ({ messageId }) => {
            setStoreUSerMessage(prevMessages =>
                prevMessages.map(msg =>
                    msg.message._id === messageId ? { ...msg, deleted: true } : msg
                )
            );
        });

        // Cleanup function
        return () => {
            if (currentSocket) {
                currentSocket.off("connect");
                currentSocket.off("connect_error");
                currentSocket.off("disconnect");
                currentSocket.off("NEW_MESSAGE");
                currentSocket.off("SPAM_DETECTED");
                currentSocket.off("BAD_WORD_DETECTED");
                currentSocket.off("DELETE_MESSAGE");
            }
        };
    }, [myId, currUser.chatId]); // Only depend on these values

    // Join room when messages change
    useEffect(() => {
        if (socket && isConnected && messages) {
            console.log("Joining room:", messages);
            socket.emit("JOIN_ROOM", messages);
            setCurrentUserId(messages);
        }
    }, [socket, isConnected, messages]);

    useEffect(() => {
        setStoreUSerMessage([])
    }, [messages])

    // ✅ FIX: Wrap sendMessage in useCallback to prevent unnecessary re-renders
    const sendMessage = useCallback(async (message, chatId, userId) => {
        if (!socket || !isConnected) {
            toast.error("Not connected to server");
            return;
        }

        if (!message.trim()) {
            toast.error("Message cannot be empty");
            return;
        }

        setCurrentUserId(userId);
        setCheck(true);

        console.log("Sending message:", { message, chatId, userId, messages });

        try {
            socket.emit("NEW_MESSAGE", {
                message: message.trim(),
                chatId,
                userId,
                currentChatId: messages
            });
            setUserMessage(message);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
            setCheck(false);
        }
    }, [socket, isConnected, messages]); // Add dependencies that sendMessage uses

    useEffect(() => {
        if (!messages) {
            console.log('No user selected for messaging');
            return;
        }

        const sendId = async () => {
            try {
                setLoading(true);
                const response = await api.post("chat/mymessages/", { userId: messages });
                const { text, details, chatId, message, currUserId } = response.data;

                setCurrUser({
                    details,
                    chatId,
                    text,
                    userId: currUserId,
                    message
                });

                // Register user with socket if connected
                if (socket && isConnected && chatId) {
                    socket.emit("REGISTER_USER", {
                        userId: myId,
                        chatId: chatId
                    });
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setLoading(false);
            }
        };

        sendId();
    }, [messages, socket, isConnected, myId]);

    const [search, setSearch] = useState("")
    const [searchedUsers, setSearchedUsers] = useState(users?.findUsers || [])

    useEffect(() => {
        if (users && users.findUsers) {
            if (search.length > 0) {
                const findUsers = users.findUsers.filter(x =>
                    x.firstname.toLowerCase().includes(search.toLowerCase())
                )
                setSearchedUsers(findUsers)
            } else {
                setSearchedUsers(users.findUsers)
            }
        }
    }, [search, users])

    // ✅ FIX: Now include sendMessage in dependencies since it's wrapped in useCallback
    const contextValue = useMemo(() => ({
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
        isConnected,
        myDetails,
        latestDatas,
        setLoggedIn,
        setSearch,
        searchedUsers,
        authLoading,
        CurrentUserId
    }), [
        api,
        sendMessage, // ✅ Now this is stable due to useCallback
        users,
        currUser,
        loading,
        userId,
        storeUserMessage,
        check,
        socket,
        isConnected,
        myDetails,
        latestDatas,
        searchedUsers,
        authLoading,
        CurrentUserId
    ]);

    return (
        <storeContext.Provider value={contextValue}>
            {props.children}
        </storeContext.Provider>
    )
}

export default StoreContextProvider