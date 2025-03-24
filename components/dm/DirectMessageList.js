
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import NewDMModal from '@/components/modals/NewDMModal'

export default function DirectMessageList({ conversations, activeConversation, onSelectConversation }) {
  const router = useRouter()
  const [isNewDMModalOpen, setIsNewDMModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleNewDM = (conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const recipient = conversation.participants.find(p => p._id !== conversation.creator._id)
    return recipient?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Find a conversation"
            className="w-full bg-discord-dark py-1 px-2 pr-8 rounded text-sm text-discord-gray-text focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={14} className="absolute right-2 top-2 text-discord-gray-muted" />
        </div>
      </div>

      <div className="px-2">
        <button
          className="w-full flex items-center px-2 py-1 text-discord-gray-text hover:bg-discord-gray-lighter rounded-md"
          onClick={() => setIsNewDMModalOpen(true)}
        >
          <Plus size={16} className="mr-2" />
          <span>Create DM</span>
        </button>
      </div>
      
      <div className="mt-2">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => {
            const recipient = conversation.participants.find(p => p._id !== conversation.creator._id)
            const lastMessage = conversation.lastMessage
            
            return (
              <div
                key={conversation._id}
                className={`flex items-center px-2 py-2 mx-2 rounded cursor-pointer ${
                  activeConversation?._id === conversation._id ? 'bg-discord-gray-lighter' : 'hover:bg-discord-gray-lighter'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative">
                  <Image
                    src={recipient?.avatar || `https://ui-avatars.com/api/?name=${recipient?.username}&background=random`}
                    alt={recipient?.username}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-dark ${
                    recipient?.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                  }`}></div>
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`font-medium truncate ${
                      activeConversation?._id === conversation._id ? 'text-white' : 'text-discord-gray-text'
                    }`}>
                      {recipient?.username}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-discord-gray-muted">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className="text-xs text-discord-gray-muted truncate">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4 text-discord-gray-muted">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
      </div>

      {isNewDMModalOpen && (
        <NewDMModal
          onClose={() => setIsNewDMModalOpen(false)}
          onDMCreated={handleNewDM}
        />
      )}
    </div>
  )
}
