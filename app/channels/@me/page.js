
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import ChannelSidebar from '@/components/navigation/ChannelSidebar'
import DirectMessageList from '@/components/dm/DirectMessageList'
import ChatArea from '@/components/chat/ChatArea'
import UserPanel from '@/components/user/UserPanel'
import LoadingScreen from '@/components/LoadingScreen'

export default function DirectMessages() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
          withCredentials: true
        })
        setConversations(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        toast.error('Failed to load direct messages')
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      if (message.conversationId) {
        setConversations(prev => {
          const updatedConversations = [...prev]
          const index = updatedConversations.findIndex(c => c._id === message.conversationId)
          
          if (index !== -1) {
            updatedConversations[index] = {
              ...updatedConversations[index],
              lastMessage: message,
              updatedAt: new Date().toISOString()
            }
            
            // Sort conversations by most recent message
            updatedConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          }
          
          return updatedConversations
        })
      }
    }

    const handleNewConversation = (conversation) => {
      setConversations(prev => {
        // Check if conversation already exists
        const exists = prev.some(c => c._id === conversation._id)
        if (exists) return prev
        return [conversation, ...prev]
      })
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('newConversation', handleNewConversation)
    
    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('newConversation', handleNewConversation)
    }
  }, [socket])

  const handleSelectConversation = (conversation) => {
    // Leave previous conversation room if exists
    if (socket && activeConversation) {
      socket.emit('leaveConversation', activeConversation._id)
    }
    
    setActiveConversation(conversation)
    
    // Join new conversation room
    if (socket && conversation) {
      socket.emit('joinConversation', conversation._id)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen w-full">
      <ChannelSidebar type="direct-messages" conversations={conversations} />
      
      <div className="flex flex-col flex-1 bg-discord-gray-light">
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col w-60 bg-discord-gray-dark">
            <div className="px-3 py-4 shadow-md">
              <h2 className="font-semibold text-white">Direct Messages</h2>
            </div>
            <DirectMessageList 
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
            />
            <UserPanel user={user} />
          </div>
          
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <ChatArea 
                type="conversation"
                channel={activeConversation}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-discord-gray-muted">
                <div className="mb-4 text-5xl">👋</div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome to Direct Messages!</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
