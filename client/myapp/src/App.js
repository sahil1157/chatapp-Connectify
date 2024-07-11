import React from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import Routing from './Components/Routes/Routing'

const App = () => {

  // const socket = io('http://localhost:5000/')
  // const api = axios.create({
  //   baseURL: 'http://localhost:5000/',
  //   withCredentials: true
  // })

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log('connected', socket.id)
  //   })
  //   socket.on('welcome', (s) => { console.log(s) })
  // }, [])

  return (
    <>
      <Routing />
    </>
  )
}

export default App
