import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import sideSearch from '../../images/FunnelSimple.png';
import image from '../../images/Group 3.png';
import ChatProp from './ChatProp';
import MyPeople from './MyPeople';
import CallFriend from './PhoneAFriend';

const Chats = () => {
    return (
        <div className='flex flex-row items-center w-full'>
            <div className='w-[384px] bg-[#F8FAFF] div1 gap-6 flex flex-col p-7 h-full rounded-r-2xl'>
                <div>
                    <p className='text-black text-2xl font-[600]'>Chats</p>
                </div>
                <div>
                    <form className='relative w-full flex items-center' action=''>
                        <input
                            type='text'
                            placeholder='search'
                            className='p-6 bg-[#EAF2FE] placeholder:text-[#709CE6] outline-none text-lg flex justify-center items-center px-14 h-[27px] w-[327px] rounded-3xl'
                        />
                        <CiSearch size={23} className='flex absolute left-5 items-center cursor-pointer text-[#709CE6]' />
                        <img src={sideSearch} alt='' className='absolute flex right-5 w-[24px] h-[24px]' />
                    </form>
                </div>
                <div className='mt-4 flex w-full flex-col gap-4'>
                    <div>
                        <p className='text-lg text-[#676667] font-[700]'>All Chats</p>
                        <hr className=' mt-3 border-[#B4B4B4]' />
                    </div>
                    <Routes>
                        <Route path='/' element={<ChatProp />} />
                        <Route path='/mypeople' element={<MyPeople />} />
                        <Route path='/call' element={<CallFriend />} />
                    </Routes>
                </div>
            </div>
            <div className='w-full h-full flex flex-col gap-5 justify-center items-center'>
                <img src={image} alt='' />
                <p className='font-[600] font-sans text-xl'>
                    Select a conversation or start a <span className='text-[#5B96F7]'>new one</span>
                </p>
            </div>
        </div>
    );
};

export default Chats;
