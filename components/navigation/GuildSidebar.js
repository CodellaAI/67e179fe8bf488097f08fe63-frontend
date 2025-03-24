
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Plus, Compass, Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import CreateGuildModal from '@/components/modals/CreateGuildModal'
import JoinGuildModal from '@/components/modals/JoinGuildModal'

export default function GuildSidebar() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [guilds, setGuilds] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds`, {
          withCredentials: true
        })
        setGuilds(response.data)
      } catch (error) {
        console.error('Failed to fetch guilds:', error)
        toast.error('Failed to load servers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuilds()
  }, [])

  const handleGuildCreated = (newGuild) => {
    setGuilds(prev => [...prev, newGuild])
    router.push(`/guilds/${newGuild._id}`)
  }

  const handleGuildJoined = (guild) => {
    if (!guilds.some(g => g._id === guild._id)) {
      setGuilds(prev => [...prev, guild])
    }
    router.push(`/guilds/${guild._id}`)
  }

  const navigateToGuild = (guildId) => {
    router.push(`/guilds/${guildId}`)
  }

  const navigateToDirectMessages = () => {
    router.push('/channels/@me')
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Check if we're in a guild route
  const isActive = (guildId) => {
    return params?.guildId === guildId
  }

  // Check if we're in the DM route
  const isDMActive = () => {
    return router.pathname === '/channels/@me'
  }

  return (
    <div className="w-[72px] h-screen bg-discord-dark flex flex-col items-center py-3 overflow-y-auto">
      {/* Direct Messages Button */}
      <div className="relative mb-2">
        {isDMActive() && <div className="server-indicator"></div>}
        <button 
          className={`server-icon mb-2 ${isDMActive() ? 'server-active' : ''}`}
          onClick={navigateToDirectMessages}
        >
          <Download size={24} />
        </button>
      </div>
      
      <div className="w-8 h-0.5 bg-discord-gray-lighter rounded-full mb-2"></div>
      
      {/* Guild List */}
      <div className="flex flex-col items-center space-y-2 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-12 w-12">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-discord-primary"></div>
          </div>
        ) : (
          guilds.map(guild => (
            <div key={guild._id} className="relative">
              {isActive(guild._id) && <div className="server-indicator"></div>}
              <button
                className={`server-icon ${isActive(guild._id) ? 'server-active' : ''}`}
                onClick={() => navigateToGuild(guild._id)}
                title={guild.name}
              >
                {guild.icon ? (
                  <Image 
                    src={guild.icon}
                    alt={guild.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  getInitials(guild.name)
                )}
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Add Server Button */}
      <div className="mt-auto flex flex-col items-center space-y-2">
        <button 
          className="server-icon bg-discord-gray-lighter hover:bg-discord-green"
          onClick={() => setIsCreateModalOpen(true)}
          title="Create a server"
        >
          <Plus size={24} />
        </button>
        
        <button 
          className="server-icon bg-discord-gray-lighter hover:bg-discord-green"
          onClick={() => setIsJoinModalOpen(true)}
          title="Join a server"
        >
          <Compass size={24} />
        </button>
      </div>

      {isCreateModalOpen && (
        <CreateGuildModal 
          onClose={() => setIsCreateModalOpen(false)}
          onGuildCreated={handleGuildCreated}
        />
      )}

      {isJoinModalOpen && (
        <JoinGuildModal 
          onClose={() => setIsJoinModalOpen(false)}
          onGuildJoined={handleGuildJoined}
        />
      )}
    </div>
  )
}
