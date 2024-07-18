import React from 'react'
import { ChatsArray } from './ChatsArray'

const MyPeople = () => {
    return (
        <>
            <div className='flex mt-2 flex-col gap-7'>
                {
                    ChatsArray && ChatsArray.map((x, ind) => {
                        return (
                            <div key={ind} className='flex flex-row gap-5 w-full'>
                                <div className='min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full overflow-hidden'>
                                    <img src={x.icon} alt="" className='w-full h-full object-cover rounded-full' />
                                </div>
                                <p className='text-md flex items-center justify-center font-bold'>{x.name}</p>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default MyPeople
