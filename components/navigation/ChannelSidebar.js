
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Settings, 
  Hash, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Users, 
  UserPlus,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import UserPanel from '@/components/user/UserPanel'
import CreateChannelModal from '@/components/modals/CreateChannelModal'
import GuildSettingsModal from '@/components/modals/GuildSettingsModal'
import InviteModal from '@/components/modals/InviteModal'
import MembersModal from '@/components/modals/MembersModal'

export default function ChannelSidebar({ 
  type, 
  guild, 
  channels = [], 
  conversations = [],
  activeChannel,
  onSelectChannel
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  const handleChannelCreated = (newChannel) => {
    if (onSelectChannel) {
      onSelectChannel(newChannel)
    }
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const isCategoryExpanded = (categoryId) => {
    return expandedCategories[categoryId] !== false // Default to expanded
  }

  const channelsByCategory = channels.reduce((acc, channel) => {
    const category = channel.category || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(channel)
    return acc
  }, {})

  const isAdmin = guild?.roles?.some(role => 
    role.members.includes(user?._id) && role.permissions.includes('ADMINISTRATOR')
  )

  const canManageChannels = isAdmin || guild?.roles?.some(role => 
    role.members.includes(user?._id) && role.permissions.includes('MANAGE_CHANNELS')
  )

  const canManageGuild = isAdmin || guild?.roles?.some(role => 
    role.members.includes(user?._id) && role.permissions.includes('MANAGE_GUILD')
  )

  return (
    <div className="w-60 h-screen bg-discord-gray-dark flex flex-col">
      {/* Header */}
      {type === 'guild' && guild ? (
        <div className="p-4 border-b border-discord-dark shadow-sm flex justify-between items-center">
          <h2 className="font-bold text-white truncate">{guild.name}</h2>
          {canManageGuild && (
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-discord-gray-text hover:text-white"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 border-b border-discord-dark shadow-sm">
          <h2 className="font-bold text-white">Direct Messages</h2>
        </div>
      )}

      {/* Guild Actions */}
      {type === 'guild' && (
        <div className="px-2 py-2 border-b border-discord-dark">
          <button 
            className="w-full px-2 py-1 flex items-center text-discord-gray-text hover:text-white hover:bg-discord-gray-lighter rounded"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus size={16} className="mr-2" />
            <span>Invite People</span>
          </button>
          
          <button 
            className="w-full px-2 py-1 flex items-center text-discord-gray-text hover:text-white hover:bg-discord-gray-lighter rounded"
            onClick={() => setIsMembersModalOpen(true)}
          >
            <Users size={16} className="mr-2" />
            <span>View Members</span>
          </button>
        </div>
      )}

      {/* Channels or DMs List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {type === 'guild' ? (
          Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
            <div key={category} className="mb-2">
              <div 
                className="flex items-center justify-between px-1 py-1 text-xs font-semibold text-discord-gray-muted cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {isCategoryExpanded(category) ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                <span className="uppercase flex-1 ml-1">{category}</span>
                {canManageChannels && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsChannelModalOpen(true)
                    }}
                    className="text-discord-gray-muted hover:text-white"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              
              {isCategoryExpanded(category) && categoryChannels.map(channel => (
                <div 
                  key={channel._id}
                  className={`flex items-center px-2 py-1 rounded cursor-pointer ${
                    activeChannel?._id === channel._id ? 'channel-active' : 'channel-hover'
                  }`}
                  onClick={() => onSelectChannel(channel)}
                >
                  <Hash size={16} className="text-discord-gray-muted mr-1" />
                  <span className={`truncate ${activeChannel?._id === channel._id ? 'text-white' : 'text-discord-gray-text'}`}>
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div>
            {/* Direct Message list would go here */}
            <div className="text-discord-gray-muted text-xs font-semibold uppercase px-2 py-1">
              Direct Messages
            </div>
          </div>
        )}
      </div>

      {/* User Panel */}
      <UserPanel user={user} />

      {/* Modals */}
      {isChannelModalOpen && (
        <CreateChannelModal 
          guildId={guild._id}
          onClose={() => setIsChannelModalOpen(false)}
          onChannelCreated={handleChannelCreated}
        />
      )}

      {isSettingsModalOpen && (
        <GuildSettingsModal 
          guild={guild}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal 
          guild={guild}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {isMembersModalOpen && (
        <MembersModal 
          guild={guild}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}
    </div>
  )
}
