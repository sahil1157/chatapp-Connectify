import React, { useContext } from 'react'
import IndexDash from '../Components/DashB/IndexDash'
import { storeContext } from '../Components/Context/storeContext'
import Loading from './Loading'

const DashB = () => {
  const { authLoading } = useContext(storeContext)
  return (
    <div className={`${authLoading ? "h-screen justify-center items-center flex flex-row" : 'h-full'}`}>
      {
        authLoading ? <Loading /> : <IndexDash />
      }
    </div>
  )
}

export default DashB
