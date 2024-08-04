import React, { useContext } from 'react'
import { FaChevronLeft } from "react-icons/fa6";
import { storeContext } from '../Context/storeContext';
import Loading from '../../Pages/Loading';
import { RiNotification2Line } from "react-icons/ri";
import { IoIosLock } from "react-icons/io";
import { GoKey } from "react-icons/go";
import { IoHelpOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";

const MyProfile = () => {

    const { myDetails } = useContext(storeContext)


    const arr = [
        {
            name: "Notification",
            icon: <RiNotification2Line size={25} />
        },
        {
            name: "Security",
            icon: <GoKey size={25} />
        },
        {
            name: "Privacy",
            icon: <IoIosLock size={25} />
        },
        {
            name: "Request Account Info",
            icon: <LuClipboardList size={25} />
        },
        {
            name: "Help",
            icon: <IoHelpOutline size={25} />
        },
    
    ]
    return (
        <div className='border-r-[2px] border-r-[#00000040] border-neutral-500 p-7 h-screen lg:max-w-[390px] w-full'>
            <div className='flex flex-col gap-12 w-full h-full'>
                <div className='flex items-center flex-row gap-3'>
                    <FaChevronLeft size={28} className='text-[#4B4B4B]' />
                    <p className='md:text-[32px] px-3 text-md  font-[500] text-black'>Settings</p>
                </div>
                {
                    myDetails && myDetails ? (
                        <div className='flex gap-5 w-full h-fit'>
                            <button className='flex justify-center h-[55px] w-[55px]'>
                                <img src={myDetails?.avatar?.url} className='rounded-full w-full h-full object-cover' alt='' />
                            </button>
                            <div className='flex text-[18px] md:text-[20px] font-[600] font-sans text-[#424242] flex-row gap-2'>
                                <span>{myDetails?.firstname}</span>
                                <span>{myDetails?.lastname}</span>
                            </div>
                        </div>
                    ) :
                        <Loading />
                }

                <div className='flex flex-col gap-8'>
                    {
                        arr && arr.map((x, ind) => {
                            return (
                                <button key={ind} className='flex  text-[#727375] flex-col gap-5'>
                                    <div className='flex flex-row gap-5 items-center w-full'>
                                        <span>{x.icon}</span>
                                        <p className='text-[12px] font-[600]'>{x.name}</p>
                                    </div>
                                    <hr className='border-[1px] w-full border-[#00000040]' />
                                </button>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default MyProfile
