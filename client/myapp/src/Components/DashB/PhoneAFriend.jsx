import React from 'react'
import { ChatsArray } from './ChatsArray'
import { CiPhone } from 'react-icons/ci'

const CallFriend = () => {
    return (
        <>
            <div className='flex mt-2 flex-col gap-7'>
                {
                    ChatsArray && ChatsArray.map((x, ind) => {
                        return (
                            <div className='flex items-center flex-row justify-between w-full'>
                                <div key={ind} className='flex flex-row gap-5 w-full'>
                                    <div className='min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full overflow-hidden'>
                                        <img src={x.icon} alt="" className='w-full h-full object-cover rounded-full' />
                                    </div>
                                    <p className='text-md flex items-center justify-center font-bold'>{x.name}</p>
                                </div>
                                <button className='h-full text-black items-center flex'>
                                    <CiPhone className='text-black' size={25} />
                                </button>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default CallFriend
