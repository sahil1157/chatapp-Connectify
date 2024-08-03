import React, { useContext } from 'react'
import IndexDash from '../Components/DashB/IndexDash'
import { storeContext } from '../Components/Context/storeContext'
import Loading from './Loading'
import MainDash from '../Components/DashB/SideMenus'

const DashB = () => {
  const { authLoading } = useContext(storeContext)
  return (
    <div className={`${authLoading ? "h-screen justify-center items-center flex flex-row" : 'h-full'}`}>
      {
        authLoading ? <Loading /> : <MainDash />
      }
    </div>
  )
}

export default DashB
