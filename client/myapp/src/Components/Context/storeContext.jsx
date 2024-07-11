import { createContext, useState } from "react";
import axios from 'axios'

export const storeContext = createContext(null)

const StoreContextProvider = (props) => {

    // storing the value of userSignedup details to backend
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    })



    const contextValue = {
        api,

    }

    return <storeContext.Provider value={contextValue}>
        {props.children}
    </storeContext.Provider>
}

export default StoreContextProvider