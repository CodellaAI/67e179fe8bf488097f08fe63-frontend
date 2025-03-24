
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import ChannelSidebar from '@/components/navigation/ChannelSidebar'
import ChatArea from '@/components/chat/ChatArea'
import LoadingScreen from '@/components/LoadingScreen'
import { useSocket } from '@/hooks/useSocket'

export default function GuildChannels() {
  const router = useRouter()
  const params = useParams()
  const { guildId } = params
  const { socket } = useSocket()
  
  const [guild, setGuild] = useState(null)
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGuildData = async () => {
      try {
        const [guildResponse, channelsResponse] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}`, {
            withCredentials: true
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/channels`, {
            withCredentials: true
          })
        ])

        setGuild(guildResponse.data)
        setChannels(channelsResponse.data)
        
        // Set the first channel as active if no channel is selected
        if (channelsResponse.data.length > 0 && !activeChannel) {
          setActiveChannel(channelsResponse.data[0])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch guild data:', error)
        toast.error('Failed to load guild data')
        setIsLoading(false)
        router.push('/channels/@me')
      }
    }

    if (guildId) {
      fetchGuildData()
    }
  }, [guildId, router])

  useEffect(() => {
    if (!socket || !guildId) return

    const handleNewChannel = (channel) => {
      if (channel.guild === guildId) {
        setChannels(prev => [...prev, channel])
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

    socket.on('newChannel', handleNewChannel)
    socket.on('channelUpdate', handleChannelUpdate)
    socket.on('channelDelete', handleChannelDelete)
    
    return () => {
      socket.off('newChannel', handleNewChannel)
      socket.off('channelUpdate', handleChannelUpdate)
      socket.off('channelDelete', handleChannelDelete)
    }
  }, [socket, guildId, channels, activeChannel])

  const handleSelectChannel = (channel) => {
    setActiveChannel(channel)
  }

  if (isLoading) {
    return <LoadingScreen />
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
    <>
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
    </>
  )
}
