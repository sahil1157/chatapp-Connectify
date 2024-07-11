import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Signup from '../../Pages/Signup'
import Login from '../../Pages/Login'

const Routing = () => {
    return (
        <>
            <Routes>
                <Route exact path='/signup' element={<Signup />} />
                <Route exact path='/' element={<Login />} />
            </Routes>
        </>
    )
}

export default Routing
