import React, { useContext } from 'react';
import { storeContext } from "../../Components/Context/storeContext";
import random from '../../images/Parrot.png'

const ChatProp = () => {
    const { users, getMessages, setCurrentUserId } = useContext(storeContext);


    return (
        <div className='flex flex-col gap-7 overflow-y-auto no-scrollbar h-full'>
            {users && users.map((x, ind) => {
                return (
                    <div key={ind} onClick={() => { getMessages(x._id); setCurrentUserId(x._id) }} className='mt-2 cursor-pointer w-full flex flex-row justify-between gap-5'>
                        <div className='flex flex-row gap-5 w-full overflow-hidden'>
                            <div className='min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full overflow-hidden'>
                                <img src={x.avatar.url ? x.avatar.url : random} alt="" className='w-full h-full object-cover rounded-full' />
                            </div>
                            <div className='flex flex-col w-full overflow-hidden'>
                                <div className='flex flex-row gap-1'>
                                    <p className='text-md font-bold'>{x.firstname}</p>
                                    <p className='text-md font-bold'>{x.lastname}</p>
                                </div>
                                <p className='text-sm text-[#7C7C7D] truncate'>hiii there</p>
                            </div>
                        </div>
                        <p className='text-sm text-[#686768]'>2020/12/12</p>
                    </div>
                );
            })}
        </div>

    );
};

export default ChatProp;
