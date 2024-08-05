import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import sideSearch from '../../images/FunnelSimple.png';
import image from '../../images/Group 3.png';
import ChatProp from './ChatProp';
import MyPeople from './MyPeople';
import CallFriend from './PhoneAFriend';
import Messages from './Messages/Messages';
import { storeContext } from '../Context/storeContext';
import Loading from '../../Pages/Loading';
import IndexMyProfile from '../Settings/IndexMyProfile';

const Chats = ({ setOpen, track }) => {
    const { currUser, loading, setSearch } = useContext(storeContext)
    const route = useLocation()
    const [location, setLocation] = useState(route.pathname)

    useEffect(() => {
        setLocation(route.pathname)
    }, [route.pathname])

    const checkRoute = location === "/myprofile"

    return (
        <div className={`flex  md:flex-row gap-3 w-full`}>
            {/* Sidebar */}
            {
                checkRoute ? <IndexMyProfile /> :
                    <div className='md:max-w-[430px] w-full gap-6 flex flex-col p-4 md:p-7'>
                        <div>
                            <p className='text-black text-2xl font-[600]'>Chats</p>
                        </div>
                        <div>
                            <form className='relative w-full flex items-center' action=''>
                                <input
                                    onChange={(e) => setSearch(e.target.value)}
                                    type='text'
                                    placeholder='Search'
                                    className='p-4 bg-[#EAF2FE] placeholder:text-[#709CE6] outline-none text-lg flex items-center pl-12 pr-12 w-full rounded-3xl'
                                />
                                <CiSearch size={23} className='absolute left-4 text-[#709CE6]' />
                                <img src={sideSearch} alt='' className='absolute right-4 w-[24px] h-[24px]' />
                            </form>
                        </div>
                        <div className='mt-4 flex flex-col gap-5 overflow-y-scroll'>
                            <div>
                                <p className='text-lg text-[#676667] font-[700]'>All Chats</p>
                                <hr className='mt-3 border-[#B4B4B4]' />
                            </div>
                            <Routes>
                                <Route path='/mychats' element={<ChatProp setOpen={setOpen} />} />
                                <Route path='/mypeople' element={<MyPeople />} />
                                <Route path='/call' element={<CallFriend />} />
                                <Route exact path='/myprofile' element={<IndexMyProfile />} />
                            </Routes>
                        </div>
                    </div>
            }
            {/* Default Message Placeholder */}
            {
                currUser && !currUser.details ? (
                    <div className='w-full p-3 hidden md:flex h-full flex-col gap-5 justify-center items-center'>
                        <img src={image} alt='' />
                        <p className='font-[600] font-sans text-md lg:text-xl'>
                            Select a conversation or start a <span className='text-[#5B96F7]'>new one</span>
                        </p>
                    </div>
                )
                    : (
                        loading && loading ? <Loading /> : <div className='w-full hidden md:flex h-full'>
                            <Messages currUser={currUser} />
                        </div>
                    )
            }

        </div>
    );
};

export default Chats;
