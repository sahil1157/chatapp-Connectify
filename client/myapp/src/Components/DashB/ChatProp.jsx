import React, { useContext } from 'react';
import { storeContext } from "../../Components/Context/storeContext";
import random from '../../images/Parrot.png';

const ChatProp = ({setOpen}) => {
    const { users, getMessages, setCurrentUserId, latestDatas } = useContext(storeContext);


    const getLatestMessage = (userId) => {

        if (latestDatas && latestDatas.latestMessages) {
            const latestMessageData = latestDatas.latestMessages.find(x =>
                x.members && x.members._id && x.members._id.toString() === userId
            );

            if (latestMessageData) {
                const message = latestMessageData.latestmessages;
                if (message) {
                    return {
                        content: typeof message === 'string' ? message : message.content || "Be the first to start a conversation",
                        sender: message.sender && message.sender._id.toString() === latestDatas.myId ? 'you' : '',
                        date: message.createdAt || null
                    };
                }
            }
        }
        return { content: "Be the first to start a conversation", date: null };
    };

    return (
        <div onClick={() => setOpen && setOpen(true)} className='flex gap-2 flex-col overflow-y-auto no-scrollbar h-full'>
            {users && users.findUsers && users.findUsers.map((user, index) => {
                const latestMessage = getLatestMessage(user._id);
                const messageDate = latestMessage.date ? new Date(latestMessage.date).toLocaleDateString() : '';

                return (
                    <div
                        key={index}
                        onClick={() => { getMessages(user._id); setCurrentUserId(user._id); }}
                        className='mt-2 p-2 cursor-pointer border-b-[1px] border-slate-200 w-full flex flex-row justify-between gap-5'
                    >
                        <div className='flex flex-row gap-5 w-full overflow-hidden'>
                            <div className='min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full overflow-hidden'>
                                <img
                                    src={user.avatar.url ? user.avatar.url : random}
                                    alt=""
                                    className='w-full h-full object-cover rounded-full'
                                />
                            </div>
                            <div className='flex flex-col w-full overflow-hidden'>
                                <div className='flex flex-row gap-1'>
                                    <p className='text-md font-bold text-black'>{user.firstname}</p>
                                    <p className='text-md font-bold text-black'>{user.lastname}</p>
                                </div>
                                <div className='flex justify-between w-full'>
                                    <p className='text-xs text-grey-500 truncate'>
                                        {latestMessage.sender ? `${latestMessage.sender}: ` : ''}{latestMessage.content}
                                    </p>
                                    <p className='text-xs text-grey-500'>
                                        {messageDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatProp;
