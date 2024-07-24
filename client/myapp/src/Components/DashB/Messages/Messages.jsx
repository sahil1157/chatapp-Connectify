import React, { useEffect, useRef, useState, useContext } from 'react';
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineVideoCall } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSend } from "react-icons/bs";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker from 'emoji-picker-react';
import { storeContext } from "../../Context/storeContext"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';


dayjs.extend(utc);
dayjs.extend(timezone);

const Messages = ({ currUser }) => {
    const emojiRef = useRef();
    const inputRef = useRef();
    const [message, setMessage] = useState("");
    const [emojis, setEmojis] = useState(false);
    const { storeUserMessage, sendMessage, userId } = useContext(storeContext)


    const handleAddEmoji = (e) => {
        setMessage(prevMessage => prevMessage + e.emoji);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) {
                setEmojis(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [emojiRef]);

    // sending this message to backend
    const handleSubmit = (e) => {
        e.preventDefault()
        if (message.trim() && currUser.chatId && userId) {
            sendMessage(message, currUser.chatId, userId);
            setMessage("");
        }
    }

    const storeUserMsg = storeUserMessage.map(x => ({
        content: x.message.content,
        sender: x.message.sender,
        chatId: x.chatId,
        createdAt: x.message.createdAt
    }));

    const currUserMsg = currUser.message ? currUser.message.map(msg => ({
        content: msg.content,
        sender: msg.sender._id,
        chatId: currUser.chatId,
        createdAt: msg.createdAt
    })) : [];

    // Merge messages and sort by timestamp
    const combinedMessages = [
        ...storeUserMsg,
        ...currUserMsg,
        // setCurrentUserId.chatId
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const filterItems = combinedMessages && combinedMessages.filter(x => x.chatId === currUser.chatId)


    return (
        <>
            <div className='w-full flex flex-col border-l-[3px] bg-[#F0F4FA] h-full justify-between'>
                {/* top section */}
                <div className='h-[89px] items-center flex-row justify-between flex p-5 w-full border-l-[1px] bg-[#F8FAFF]'>
                    <div className='w-full relative h-full flex flex-row gap-4'>
                        <div className='flex relative h-full items-center min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full'>
                            <img src={currUser?.details?.avatar?.url} alt="" className='w-full h-full object-cover rounded-full' />
                            <p className='w-3 h-3 rounded-full bg-green-500 absolute right-[2px] bottom-0 z-50 border-2 border-white'></p>
                        </div>

                        <div className='flex flex-col gap-1 w-full'>
                            <p className='text-md w-[87px] h-[22px] font-bold'>{currUser && currUser.details && currUser.details.firstname}</p>
                            <p className='text-sm text-[#7C7C7D]'>Online</p>
                        </div>
                    </div>
                    <div className='flex mr-5 flex-row gap-8 items-center h-full'>
                        <button><MdOutlineVideoCall size={30} /></button>
                        <button> <IoCallOutline size={20} /></button>
                        <button> <CiSearch size={20} /></button>
                        <button><RxHamburgerMenu size={20} /></button>
                    </div>
                </div>

                {/* mid section ie message section */}
                <div className="flex h-full flex-col p-5 space-y-2">
                    {filterItems && filterItems.map((msg, index) => {
                        return (
                            <div
                                key={index}
                                className={`flex flex-col space-y-1 w-full ${msg.sender === userId ? 'items-end' : 'items-start'} animate-fadeInUp`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender === userId
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-300 text-black rounded-bl-none'
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {dayjs(msg.createdAt).tz('Asia/Kathmandu').format('hh:mm A')}
                                </span>
                            </div>
                        )
                    })}
                </div>
                {/* bottom section i.e sending message or textarea */}
                <div className='h-[89px] bg-[#F7F9FD] items-center justify-between flex p-5 w-full border-t-[1px]'>
                    <form onSubmit={handleSubmit} action="" className='flex flex-row gap-5 w-full items-center'>
                        <div className='relative w-full flex items-center h-full'>
                            <input
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                type="text"
                                autoFocus
                                placeholder='Write a Message...'
                                className='w-full h-[50px] pl-4 pr-12 rounded-lg border-[#EAF2FE] border-[1px] text-black placeholder:text-[#709CE6] bg-[#EAF2FE] outline-none'
                            />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setEmojis(prev => !prev);
                                }}
                                type="button"
                                className='absolute right-3 text-[#709CE6]'
                            >
                                <RiEmojiStickerLine size={20} />
                            </button>
                            <div ref={emojiRef} className='absolute bottom-12 right-3'>
                                {emojis && (
                                    <EmojiPicker
                                        theme='dark'
                                        autoFocusSearch={false}
                                        onEmojiClick={handleAddEmoji}
                                    />
                                )}
                            </div>
                        </div>
                        <button type="submit" className='bg-[#5B96F7] w-12 h-12 text-white p-3 rounded-lg'>
                            <BsSend size={20} />
                        </button>
                    </form>
                </div>
            </div >
        </>
    );
};

export default Messages;
