import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from '../../Pages/Signup';
import Login from '../../Pages/Login';
import DashB from '../../Pages/DashB';
import MainDash from '../DashB/SideMenus';

const Routing = () => {
    return (
        <Routes>
            <Route exact path='/signup' element={<Signup />} />
            <Route exact path='/login' element={<Login />} />
            <Route exact path='/mychats/*' element={<DashB />} />
            <Route path='/mychats/*' element={<MainDash/>} />
        </Routes>
    );
};

export default Routing;
