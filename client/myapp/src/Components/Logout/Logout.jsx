import React, { useContext, useEffect, useRef } from 'react'
import { RxCross1 } from "react-icons/rx";
import { useLocation, useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from "react-icons/fi";
import { storeContext } from '../Context/storeContext';
import { toast } from 'react-toastify';

const Logout = () => {
    const dialogRef = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const track = '/logout'
    const { api } = useContext(storeContext)

    const handleClose = () => {
        if (dialogRef.current) {
            dialogRef.current.close()
        }
        navigate("/mychats")
    }

    useEffect(() => {
        if (track === location.pathname && dialogRef.current) {
            dialogRef.current.showModal()
        }
    }, [location.pathname, track])

    const handleLogOut = async () => {
        try {
            const logout = await api.post("/logout")
            if (logout)
                toast.success("Logout successful")
            navigate("/login")

        } catch (error) {
            toast.error("error occured")
        }
    }

    return (
        <dialog id='dialog' ref={dialogRef} className='h-fit rounded-xl p-3 md:max-w-[580px] outline-none backdrop-blur-[12px] backdrop-brightness-50 min-w-[250px]'>
            <button onClick={handleClose} className='p-3 outline-none justify-end items-end flex text-2xl text-gray-500 hover:text-gray-700'>
                <RxCross1 />
            </button>
            <div className='flex flex-col mt-3 gap-1 w-full'>
                <hr className='border-gray-300 w-full' />
                <div className='flex gap-2 md:gap-1 p-5 text-gray-600'>
                    <FiAlertTriangle className='mr-2 text-orange-500 text-2xl' />
                    <p className='text-sm md:text-lg'>Do you really wish to leave and logout? Your messages will not be lost.</p>
                </div>
                <hr className='border-gray-300 w-full' />
            </div>
            <div className='flex mt-2 p-3 w-full items-center justify-center md:justify-end gap-4'>
                <button onClick={handleLogOut} className='bg-green-500 text-white md:w-32 md:h-11 p-2 md:p-0 h-fit w-fit rounded-md shadow-md hover:bg-green-600'>
                    Yes, log out
                </button>
                <button onClick={handleClose} className='bg-red-500 text-white md:w-32 md:h-11 p-2 md:p-0 h-fit w-fit  rounded-md shadow-md hover:bg-red-600'>
                    No, cancel
                </button>
            </div>
        </dialog>
    )
}

export default Logout
