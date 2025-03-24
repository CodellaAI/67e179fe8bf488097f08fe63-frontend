
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Settings, LogOut, Mic, Headphones, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import UserSettingsModal from '@/components/modals/UserSettingsModal'

export default function UserPanel({ user }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  return (
    <div className="bg-discord-dark p-2 flex justify-between items-center">
      <div className="flex items-center">
        <div className="relative mr-2">
          <Image
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
            alt={user.username}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-discord-green border-2 border-discord-dark"></div>
        </div>
        <div>
          <div className="font-medium text-white text-sm">{user.username}</div>
          <div className="text-xs text-discord-gray-muted">Online</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 text-discord-gray-muted">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className={`p-1 rounded hover:bg-discord-gray-lighter ${isMuted ? 'text-discord-red' : ''}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <Mic size={16} />
        </button>
        
        <button 
          onClick={() => setIsDeafened(!isDeafened)} 
          className={`p-1 rounded hover:bg-discord-gray-lighter ${isDeafened ? 'text-discord-red' : ''}`}
          title={isDeafened ? 'Undeafen' : 'Deafen'}
        >
          <Headphones size={16} />
        </button>
        
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="p-1 rounded hover:bg-discord-gray-lighter"
          title="User Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {isSettingsOpen && (
        <UserSettingsModal 
          user={user}
          onClose={() => setIsSettingsOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
