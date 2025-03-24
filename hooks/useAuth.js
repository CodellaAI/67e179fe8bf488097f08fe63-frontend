
'use client'

import { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token')
      
      if (token) {
        try {
          // Verify the token with the server
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          })
          
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth initialization error:', error)
          Cookies.remove('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const register = async (userData) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, userData, {
      withCredentials: true
    })
    return response.data
  }

  const login = async (credentials) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, 
      credentials,
      {
        withCredentials: true
      }
    )
    
    const { user, token } = response.data
    
    // Store token in cookie
    Cookies.set('token', token, { expires: 7 })
    
    setUser(user)
    setIsAuthenticated(true)
    
    return user
  }

  const logout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Remove token
    Cookies.remove('token')
    
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
