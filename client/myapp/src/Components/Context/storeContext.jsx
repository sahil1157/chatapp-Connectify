import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";

export const storeContext = createContext(null)

const StoreContextProvider = (props) => {
    const navigate = useNavigate()

    // storing the value of userSignedup details to backend
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    })

    useEffect(() => {
        const checkUserAuth = async () => {
            try {
                const checkAuth = await api.get("/chat")
                if(checkAuth)
                    return false
            } catch (error) {
                return navigate("/login")
            }}
            checkUserAuth()
    },[])


    const contextValue = {
        api,

    }

    return <storeContext.Provider value={contextValue}>
        {props.children}
    </storeContext.Provider>
}

export default StoreContextProvider