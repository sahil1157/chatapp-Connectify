import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import sideSearch from '../../images/FunnelSimple.png';
import image from '../../images/Group 3.png';
import ChatProp from './ChatProp';
import MyPeople from './MyPeople';
import CallFriend from './PhoneAFriend';
import Messages from './Messages/Messages';
import { storeContext } from '../Context/storeContext';
import Loading from '../../Pages/Loading';

const Chats = () => {
    const { currUser, loading } = useContext(storeContext)

    return (
        <div className='flex flex-row w-full'>
            {/* Sidebar */}
            <div className='max-w-[430px] gap-6 w-full bg-[#F8FAFF] flex flex-col p-7 h-full'>
                <div>
                    <p className='text-black text-2xl font-[600]'>Chats</p>
                </div>
                <div>
                    <form className='relative w-full flex items-center' action=''>
                        <input
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
                        <Route path='/' element={<ChatProp />} />
                        <Route path='/mypeople' element={<MyPeople />} />
                        <Route path='/call' element={<CallFriend />} />
                    </Routes>
                </div>
            </div>
            {/* Default Message Placeholder */}
            {
                currUser && !currUser.details ? (
                    <div className='w-full hidden md:flex h-full flex-col gap-5 justify-center items-center'>
                        <img src={image} alt='' />
                        <p className='font-[600] font-sans text-xl'>
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
            {/* Messages */}

        </div>
    );
};

export default Chats;
