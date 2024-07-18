import React, { useState, useEffect } from 'react';
import parrot from '../../images/Parrot.png';
import { AiOutlineMessage } from 'react-icons/ai';
import { IoPeople } from 'react-icons/io5';
import { HiOutlinePhone } from 'react-icons/hi';
import { CiSettings } from 'react-icons/ci';
import demo from '../../images/demo.jpg';
import { useNavigate, useLocation } from 'react-router-dom';
import Chats from './Chats';

const MainDash = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [track, setTrack] = useState(location.pathname);

    useEffect(() => {
        setTrack(location.pathname);
    }, [location.pathname]);

    const ArrayIcons = [
        {
            name: '/',
            logo: <AiOutlineMessage size={23} />,
        },
        {
            name: '/mypeople',
            logo: <IoPeople size={23} />,
        },
        {
            name: '/call',
            logo: <HiOutlinePhone size={23} />,
        },
        {
            name: '/settings',
            logo: <CiSettings size={23} />,
        },
    ];

    const handleIconClick = (link) => {
        setTrack(link); 
        navigate(link); 
    };

    return (
        <div className='w-full h-screen flex'>
            {/* Sidebar */}
            <div className='h-full p-5 justify-between flex flex-col gap-6 w-[138px] border-[4px] rounded-l-2xl bg-[#F0F4FA] border-[#F0F4FA]'>
                <div className='flex w-full items-center flex-col gap-6'>
                    <button className='w-[64px] rounded-xl h-[64px] bg-[#AFBBF7] p-4 justify-center flex items-center'>
                        <img className='h-[37px] w-[37px] rounded-xl' src={parrot} alt='' />
                    </button>
                    <div className='flex w-full items-center justify-center flex-col mt-4 gap-6'>
                        {ArrayIcons.map((icon, index) => (
                            <button
                                key={index}
                                onClick={() => handleIconClick(icon.name)}
                                className={`flex items-center justify-center rounded-xl ${track === icon.name ? 'bg-[#5B96F7] text-white' : 'text-black'}`}
                            >
                                <div className='h-[55px] w-[55px] flex items-center justify-center'>{icon.logo}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <button className='w-full flex justify-center items-center'>
                    <img src={demo} className='h-[48px] w-[48px] rounded-full' alt='' />
                </button>
            </div>
            {/* Renderimg Chats component or other components based on the route */}
            <Chats />
        </div>
    );
};

export default MainDash;
