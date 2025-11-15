import React, { useEffect, useRef, useState, useContext } from 'react';
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineVideoCall } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { BsSend } from "react-icons/bs";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaTrashAlt } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import { storeContext } from "../../Context/storeContext";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Loading from '../../../Pages/Loading';
import SmallLoading from '../../../Pages/SmallLoading';

dayjs.extend(utc);
dayjs.extend(timezone);

const Messages = ({ currUser, setOpen }) => {
  const emojiRef = useRef();
  const inputRef = useRef();
  const [message, setMessage] = useState("");
  const [emojis, setEmojis] = useState(false);
  const { storeUserMessage, sendMessage, check, userId } = useContext(storeContext);

  const handleAddEmoji = (e) => setMessage(prev => prev + e.emoji);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojis(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && currUser.chatId && userId) {
      sendMessage(message, currUser.chatId, userId);
      setMessage("");
    }
  };

  // Prepare messages
  const storeUserMsg = storeUserMessage.map(x => ({
    content: x.message.content,
    sender: x.message.sender,
    chatId: x.chatId,
    createdAt: x.message.createdAt,
    isSpam: x.isSpam || false,
    isBadWord: x.isBadWord || false,
    deleted: x.deleted || false
  }));

  const currUserMsg = currUser.message ? currUser.message.map(msg => ({
    content: msg.content,
    sender: msg.sender._id,
    chatId: currUser.chatId,
    createdAt: msg.createdAt,
    isSpam: msg.isSpam || false,
    isBadWord: msg.isBadWord || false,
    deleted: msg.deleted || false
  })) : [];

  const combinedMessages = [...storeUserMsg, ...currUserMsg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const filterItems = combinedMessages.filter(x => x.chatId === currUser.chatId);

  const chatContainerRef = useRef();
  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [storeUserMessage]);

  return (
    <div className='w-full flex flex-col border-l-[3px] bg-[#F0F4FA] h-full justify-between'>
      {/* Top section */}
      <div className='h-[89px] flex items-center justify-between p-5 w-full border-l-[1px] bg-[#F8FAFF]'>
        <div className='flex gap-4 items-center'>
          <div className='relative w-12 h-12 rounded-full overflow-hidden'>
            {currUser?.details?.avatar?.url ? (
              <img src={currUser.details.avatar.url} alt="" className='w-full h-full object-cover' />
            ) : <Loading />}
            <span className='w-3 h-3 rounded-full bg-green-500 absolute right-0 bottom-0 border-2 border-white'></span>
          </div>
          <div className='flex flex-col'>
            <p className='font-bold'>{currUser?.details?.firstname}</p>
            <p className='text-sm text-gray-500'>Online</p>
          </div>
        </div>
        <div className='flex gap-4 items-center'>
          <MdOutlineVideoCall size={30} />
          <IoCallOutline size={20} />
          <CiSearch size={20} />
          <RxHamburgerMenu size={20} />
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex flex-col h-full overflow-y-auto p-5 space-y-2">
        {filterItems.map((msg, index) => {
          const isSender = msg.sender === userId;
          const alignment = msg.deleted || isSender ? 'items-end' : 'items-start';

          let messageClasses = `px-4 py-2 rounded-lg max-w-xs relative flex items-center gap-1`;

          if (msg.deleted) {
            messageClasses += ' bg-gray-100 text-gray-500 italic flex items-center gap-2';
          } else if (msg.isSpam) {
            messageClasses += ' bg-yellow-50 border border-yellow-400 text-black';
          } else if (msg.isBadWord) {
            messageClasses += isSender ? ' bg-blue-500 text-white rounded-br-none' : ' bg-gray-300 text-black rounded-bl-none';
          } else {
            messageClasses += isSender ? ' bg-blue-500 text-white rounded-br-none' : ' bg-gray-300 text-black rounded-bl-none';
          }

          return (
            <div key={index} className={`flex flex-col ${alignment} w-full space-y-1 animate-fadeInUp relative group`}>
              <div className={messageClasses}>
                {msg.deleted ? (
                  <>
                    <FaTrashAlt />
                    <span className="text-sm">This message was removed due to spam.</span>
                  </>
                ) : (
                  <>
                    {msg.isSpam && !msg.deleted && (
                      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center group">
                        <span className="text-yellow-600  font-bold cursor-pointer">⚠️</span>
                        <span className="absolute -top-16 left-44 transform -translate-x-1/2 w-max max-w-xs bg-yellow-200 text-black text-sm px-3 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 break-words z-50 text-center">
                          SPAM ALERT! Will be deleted in 15 sec
                        </span>
                      </div>
                    )}


                    {msg.isBadWord && (
                      <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-red-500 font-bold cursor-pointer">
                        ⚠️
                        <span className="absolute right-1 -top-7 transform -translate-x-0 w-max max-w-[150px] bg-red-200 text-black text-xs px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center z-50">
                          Inappropriate word detected and censored
                        </span>
                      </span>
                    )}
                    <p>{msg.content}</p>
                  </>
                )}
              </div>
              {!msg.deleted && (
                <span className="text-xs text-gray-400">
                  {dayjs(msg.createdAt).tz('Asia/Kathmandu').format('hh:mm A')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Send message */}
      <div className='h-[89px] bg-[#F7F9FD] flex items-center p-5 border-t-[1px] w-full'>
        <form onSubmit={handleSubmit} className='flex gap-5 w-full items-center'>
          <div className='relative w-full flex items-center'>
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
              autoFocus
              placeholder='Write a Message...'
              className='w-full h-12 pl-4 pr-12 rounded-lg border border-[#EAF2FE] bg-[#EAF2FE] placeholder:text-[#709CE6] outline-none text-black'
            />
            <button
              onClick={(e) => { e.preventDefault(); setEmojis(prev => !prev); }}
              type="button"
              className='absolute right-3 text-[#709CE6]'
            >
              <RiEmojiStickerLine size={20} />
            </button>
            <div ref={emojiRef} className='absolute bottom-12 right-3'>
              {emojis && <EmojiPicker theme='dark' autoFocusSearch={false} onEmojiClick={handleAddEmoji} />}
            </div>
          </div>
          <button type="submit" className='bg-[#5B96F7] w-12 h-12 flex items-center justify-center text-white rounded-lg p-3'>
            {!check ? <BsSend size={20} /> : <SmallLoading />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
