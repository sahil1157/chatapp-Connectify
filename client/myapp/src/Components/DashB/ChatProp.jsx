import React from 'react'
import { ChatsArray } from './ChatsArray'

const ChatProp = () => {
    return (
        <>
            <div className='flex flex-col gap-7'>
                {
                    ChatsArray && ChatsArray.map((x, ind) => {
                        return (
                            <div key={ind} className='mt-2 cursor-pointer w-full flex flex-row justify-between gap-5'>
                                <div className='flex flex-row gap-5 w-full'>
                                    <div className='min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full overflow-hidden'>
                                        <img src={x.icon} alt="" className='w-full h-full object-cover rounded-full' />
                                    </div>
                                    <div className='flex flex-col w-full'>
                                        <p className='text-md w-[87px] h-[22px] font-bold'>{x.name}</p>
                                        <p className='text-sm text-[#7C7C7D]'>{x.message}</p>
                                    </div>
                                </div>
                                <p className='text-sm text-[#686768]'>{x.date}</p>
                            </div>
                        )
                    })
                }


            </div>
        </>
    )
}

export default ChatProp
