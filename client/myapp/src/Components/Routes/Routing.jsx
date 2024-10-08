import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from '../../Pages/Signup';
import Login from '../../Pages/Login';
import DashB from '../../Pages/DashB';
import IndexMyProfile from '../Settings/IndexMyProfile';

const Routing = () => {
    return (
        <Routes>
        <Route exact path='/signup' element={<Signup />} />
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/' element={<Navigate to="/mychats" />} />
        <Route exact path='/*' element={<DashB />} />
       
    </Routes>
    );
};

export default Routing;
