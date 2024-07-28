import React, { useState, useEffect, useContext } from 'react';
import parrot from '../../images/Parrot.png';
import { AiOutlineMessage } from 'react-icons/ai';
import { IoPeople } from 'react-icons/io5';
import { HiOutlinePhone } from 'react-icons/hi';
import { CiSettings } from 'react-icons/ci';
import { useNavigate, useLocation } from 'react-router-dom';
import Chats from './Chats';
import { storeContext } from '../Context/storeContext';
import Loading from '../../Pages/Loading';
import Messages from './Messages/Messages';


const MainDash = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [track, setTrack] = useState(location.pathname);
    const { myDetails,currUser } = useContext(storeContext)
    const [open, setOpen] = useState(false)


    useEffect(() => {
        setTrack(location.pathname);
    }, [location.pathname]);

    const ArrayIcons = [
        {
            name: '/mychats',
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
        <div className='w-full h-screen md:min-h-full flex'>
            {/* Sidebar */}
            <div className='h-full lg:p-5 md:p-2 p-1 md:justify-between md:w-[128px] w-[80px] lg:w-[138px] border-[4px] rounded-l-2xl bg-[#F0F4FA] border-[#F0F4FA]'>
                <div className='flex lg:mt-0 mt-5 flex-col gap-6'>
                    <div className='flex w-full items-center flex-col gap-12 md:gap-6'>
                        <button className='w-[64px] rounded-xl h-[64px] bg-[#AFBBF7] lg:p-4 md:p-2 p-1 justify-center flex items-center'>
                            <img className='lg:h-[37px] lg:w-[37px] md:h-[32px] md:w-[32px] w-[27px] h-[27px] rounded-xl' src={parrot} alt='' />
                        </button>
                        <div className='flex w-full items-center justify-center flex-col mt-4 gap-6'>
                            {ArrayIcons.map((icon, index) => (
                                <button
                                
                                    key={index}
                                    onClick={() => {handleIconClick(icon.name); setOpen(false)}}
                                    className={`flex items-center justify-center rounded-xl ${track === icon.name ? 'bg-[#5B96F7] text-white' : 'text-black'}`}
                                >
                                    <div className='lg:h-[55px] lg:w-[55px] md:w-[49px] md:h-[49px] w-[42px] h-[42px] flex items-center justify-center'>{icon.logo}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {
                        myDetails && myDetails ? (
                            <div className='flex w-full h-fit justify-center items-center'>
                                <button className='flex justify-center h-[48px] w-[48px]'>
                                    <img src={myDetails?.avatar?.url} className='rounded-full w-full h-full object-cover' alt='' />
                                </button>
                            </div>
                        ) :
                            <Loading />
                    }
                </div>
            </div>
            {/* Renderimg Chats component or other components based on the route */}
            {
                !open && !open ? 
                    <Chats setOpen={setOpen} open={open} />
                 : <div className='w-full flex md:hidden h-full'>
                    <Messages setOpen = {setOpen} currUser={currUser} />
                </div>
            }
        </div>
    );
};

export default MainDash;
