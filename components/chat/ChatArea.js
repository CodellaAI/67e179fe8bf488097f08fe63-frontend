
'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  Hash, 
  User, 
  AtSign, 
  PlusCircle, 
  Gift, 
  Gif, 
  Sticker, 
  Smile,
  Send
} from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import MessageItem from '@/components/chat/MessageItem'

export default function ChatArea({ type, channel, guild }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [recipient, setRecipient] = useState(null)

  useEffect(() => {
    if (!channel) return
    
    setIsLoading(true)
    setMessages([])

    const fetchMessages = async () => {
      try {
        let response
        
        if (type === 'channel') {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channel._id}/messages`,
            { withCredentials: true }
          )
        } else {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${channel._id}/messages`,
            { withCredentials: true }
          )
          
          // Set recipient for DM
          if (channel.participants) {
            const otherUser = channel.participants.find(p => p._id !== user?._id)
            setRecipient(otherUser)
          }
        }
        
        setMessages(response.data)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        toast.error('Failed to load messages')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [channel, type, user])

  useEffect(() => {
    if (!socket || !channel) return

    const handleNewMessage = (message) => {
      if ((type === 'channel' && message.channel === channel._id) || 
          (type === 'conversation' && message.conversationId === channel._id)) {
        setMessages(prev => [...prev, message])
      }
    }

    socket.on('newMessage', handleNewMessage)
    
    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [socket, channel, type])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageInput.trim()) return
    
    try {
      let response
      
      if (type === 'channel') {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channel._id}/messages`,
          { content: messageInput },
          { withCredentials: true }
        )
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${channel._id}/messages`,
          { content: messageInput },
          { withCredentials: true }
        )
      }
      
      setMessageInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = format(new Date(message.createdAt), 'MMM dd, yyyy')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    }, {})
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full">
      {/* Channel/DM Header */}
      <div className="flex items-center px-4 py-3 shadow-md z-10 bg-discord-gray-light">
        {type === 'channel' ? (
          <>
            <Hash size={24} className="text-discord-gray-muted mr-2" />
            <div>
              <h2 className="font-bold text-white">{channel?.name}</h2>
              <p className="text-xs text-discord-gray-muted">{channel?.topic || 'No topic set'}</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative mr-2">
              <Image
                src={recipient?.avatar || `https://ui-avatars.com/api/?name=${recipient?.username}&background=random`}
                alt={recipient?.username || 'User'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-discord-gray-light ${
                recipient?.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
              }`}></div>
            </div>
            <div>
              <h2 className="font-bold text-white">{recipient?.username || 'User'}</h2>
              <p className="text-xs text-discord-gray-muted">
                {recipient?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-discord-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-discord-gray-muted">
            <div className="mb-4 text-5xl">
              {type === 'channel' ? <Hash size={48} /> : <AtSign size={48} />}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {type === 'channel' 
                ? `Welcome to #${channel?.name}!` 
                : `This is the beginning of your conversation with ${recipient?.username}`
              }
            </h3>
            <p>
              {type === 'channel'
                ? `This is the start of the #${channel?.name} channel.`
                : 'Send a message to start the conversation!'
              }
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-discord-gray-lighter"></div>
                <div className="px-4 text-xs text-discord-gray-muted">{date}</div>
                <div className="flex-1 h-px bg-discord-gray-lighter"></div>
              </div>
              
              {dateMessages.map((message, index) => (
                <MessageItem 
                  key={message._id} 
                  message={message}
                  isGrouped={index > 0 && 
                    dateMessages[index - 1].author._id === message.author._id &&
                    new Date(message.createdAt) - new Date(dateMessages[index - 1].createdAt) < 5 * 60 * 1000}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="px-4 pb-6 pt-2">
        <form onSubmit={sendMessage} className="relative">
          <div className="flex items-center bg-discord-gray-lighter rounded-lg px-4 py-2">
            <button 
              type="button" 
              className="text-discord-gray-muted hover:text-white mr-2"
            >
              <PlusCircle size={20} />
            </button>
            
            <input
              type="text"
              placeholder={`Message ${type === 'channel' ? '#' + channel?.name : recipient?.username}`}
              className="flex-1 bg-transparent border-none focus:outline-none text-discord-gray-text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            
            <div className="flex items-center space-x-2 text-discord-gray-muted">
              <button type="button" className="hover:text-white">
                <Gift size={20} />
              </button>
              <button type="button" className="hover:text-white">
                <Gif size={20} />
              </button>
              <button type="button" className="hover:text-white">
                <Sticker size={20} />
              </button>
              <button type="button" className="hover:text-white">
                <Smile size={20} />
              </button>
              
              {messageInput.trim() && (
                <button 
                  type="submit" 
                  className="text-white hover:text-discord-primary"
                >
                  <Send size={20} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
