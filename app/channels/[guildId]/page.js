
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import ChannelSidebar from '@/components/navigation/ChannelSidebar'
import ChatArea from '@/components/chat/ChatArea'
import LoadingScreen from '@/components/LoadingScreen'
import { useSocket } from '@/hooks/useSocket'
import MembersSidebar from '@/components/navigation/MembersSidebar'

export default function GuildChannels() {
  const router = useRouter()
  const params = useParams()
  const { guildId } = params
  const { socket } = useSocket()
  
  const [guild, setGuild] = useState(null)
  const [channels, setChannels] = useState([])
  const [members, setMembers] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        // Validate guild ID format before making API calls
        const isValidId = /^[0-9a-fA-F]{24}$/.test(guildId)
        if (!isValidId) {
          throw new Error('Invalid guild ID format')
        }

        const [guildResponse, channelsResponse, membersResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}`, {
            withCredentials: true
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/channels`, {
            withCredentials: true
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/members`, {
            withCredentials: true
          })
        ])

        setGuild(guildResponse.data)
        setChannels(channelsResponse.data)
        setMembers(membersResponse.data)
        
        // Set the first channel as active if no channel is selected
        if (channelsResponse.data.length > 0 && !activeChannel) {
          setActiveChannel(channelsResponse.data[0])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch guild data:', error)
        setError(error.message || 'Failed to load guild data')
        setIsLoading(false)
        
        // Show toast with specific error message
        if (error.message === 'Invalid guild ID format') {
          toast.error('Invalid guild ID format')
        } else if (error.response?.status === 404) {
          toast.error('Guild not found')
        } else {
          toast.error('Failed to load guild data')
        }
        
        router.push('/channels/@me')
      }
    }

    if (guildId) {
      fetchGuildData()
    }
  }, [guildId, router, activeChannel])

  useEffect(() => {
    if (!socket || !guildId) return

    // Join the guild socket room
    socket.emit('joinGuild', guildId)

    const handleNewChannel = (channel) => {
      if (channel.guild === guildId) {
        setChannels(prev => {
          // Check if channel already exists
          const exists = prev.some(c => c._id === channel._id)
          if (exists) return prev
          return [...prev, channel]
        })
      }
    }

    const handleChannelUpdate = (updatedChannel) => {
      if (updatedChannel.guild === guildId) {
        setChannels(prev => 
          prev.map(channel => 
            channel._id === updatedChannel._id ? updatedChannel : channel
          )
        )
        
        if (activeChannel && activeChannel._id === updatedChannel._id) {
          setActiveChannel(updatedChannel)
        }
      }
    }

    const handleChannelDelete = (deletedChannel) => {
      if (deletedChannel.guild === guildId) {
        setChannels(prev => 
          prev.filter(channel => channel._id !== deletedChannel._id)
        )
        
        if (activeChannel && activeChannel._id === deletedChannel._id) {
          // Set the first available channel as active
          setActiveChannel(prev => {
            const remainingChannels = channels.filter(c => c._id !== deletedChannel._id)
            return remainingChannels.length > 0 ? remainingChannels[0] : null
          })
        }
      }
    }

    const handleMemberJoin = (data) => {
      if (data.guildId === guildId) {
        setMembers(prev => {
          // Check if member already exists
          const exists = prev.some(m => m._id === data.user._id)
          if (exists) return prev
          return [...prev, data.user]
        })
      }
    }

    const handleMemberLeave = (data) => {
      if (data.guildId === guildId) {
        setMembers(prev => 
          prev.filter(member => member._id !== data.userId)
        )
      }
    }

    socket.on('newChannel', handleNewChannel)
    socket.on('channelUpdate', handleChannelUpdate)
    socket.on('channelDelete', handleChannelDelete)
    socket.on('memberJoin', handleMemberJoin)
    socket.on('memberLeave', handleMemberLeave)
    
    return () => {
      // Leave the guild socket room when component unmounts
      socket.emit('leaveGuild', guildId)
      
      socket.off('newChannel', handleNewChannel)
      socket.off('channelUpdate', handleChannelUpdate)
      socket.off('channelDelete', handleChannelDelete)
      socket.off('memberJoin', handleMemberJoin)
      socket.off('memberLeave', handleMemberLeave)
    }
  }, [socket, guildId, channels, activeChannel])

  const handleSelectChannel = (channel) => {
    // Leave previous channel room if exists
    if (socket && activeChannel) {
      socket.emit('leaveChannel', activeChannel._id)
    }
    
    setActiveChannel(channel)
    
    // Join new channel room
    if (socket && channel) {
      socket.emit('joinChannel', channel._id)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push('/channels/@me')} 
            className="button-primary"
          >
            Go back to Direct Messages
          </button>
        </div>
      </div>
    )
  }

  if (!guild) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Guild not found</h2>
          <button 
            onClick={() => router.push('/channels/@me')} 
            className="button-primary"
          >
            Go back to Direct Messages
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <ChannelSidebar 
        type="guild" 
        guild={guild}
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
      />
      
      <div className="flex-1 flex flex-col bg-discord-gray-light">
        {activeChannel ? (
          <ChatArea 
            type="channel"
            channel={activeChannel}
            guild={guild}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-discord-gray-muted">
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to {guild.name}!</h3>
            <p>Select a channel to start chatting</p>
          </div>
        )}
      </div>

      <MembersSidebar 
        guild={guild}
        members={members}
      />
    </div>
  )
}
