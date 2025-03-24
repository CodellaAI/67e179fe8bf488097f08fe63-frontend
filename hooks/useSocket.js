
'use client'

import { useState, useEffect, useContext, createContext } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    let newSocket

    if (isAuthenticated && user) {
      // Connect to socket server
      newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
      })

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
      })

      setSocket(newSocket)
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated, user])

  const value = { socket }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export default SocketProvider
