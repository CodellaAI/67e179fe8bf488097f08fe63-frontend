
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Shield, Crown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function MembersSidebar({ guild, members = [] }) {
  const { user } = useAuth()
  const [roleGroups, setRoleGroups] = useState({})

  useEffect(() => {
    if (!guild || !members.length) return

    const groups = {}
    
    // First, create a mapping of role IDs to roles for easy access
    const roleMap = {}
    guild.roles.forEach(role => {
      roleMap[role._id] = role
    })
    
    // Group members by their highest role
    members.forEach(member => {
      // Find all roles for this member
      const memberRoles = guild.roles.filter(role => 
        role.members.includes(member._id)
      )
      
      // Sort roles by position (higher position = more important)
      const sortedRoles = [...memberRoles].sort((a, b) => b.position - a.position)
      
      // Get the highest role or use "online" as default
      const highestRole = sortedRoles.length > 0 ? sortedRoles[0] : { name: 'online' }
      
      // Special case for owner
      const isOwner = guild.owner === member._id
      const groupKey = isOwner ? 'owner' : highestRole.name
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: isOwner ? 'owner' : highestRole._id,
          name: isOwner ? 'Owner' : highestRole.name,
          color: highestRole.color,
          position: isOwner ? 999 : highestRole.position,
          members: []
        }
      }
      
      groups[groupKey].members.push({
        ...member,
        isOwner
      })
    })
    
    // Sort groups by position
    setRoleGroups(groups)
  }, [guild, members])

  // Sort role groups by position
  const sortedGroups = Object.values(roleGroups).sort((a, b) => b.position - a.position)

  return (
    <div className="w-60 h-screen bg-discord-gray-dark flex flex-col">
      <div className="p-4 border-b border-discord-dark">
        <h2 className="font-bold text-white">Members — {members.length}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {sortedGroups.map(group => (
          <div key={group.id} className="mb-4">
            <div className="text-xs font-semibold text-discord-gray-muted uppercase px-2 py-1">
              {group.name} — {group.members.length}
            </div>
            
            {group.members.map(member => (
              <div 
                key={member._id}
                className="flex items-center px-2 py-1 rounded hover:bg-discord-gray-lighter cursor-pointer"
              >
                <div className="relative">
                  <Image
                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}&background=random`}
                    alt={member.username}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-discord-gray-dark ${
                    member.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                  }`}></div>
                </div>
                
                <div className="ml-2 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: group.color || 'white' }}
                  >
                    {member.username}
                  </span>
                  
                  {member.isOwner && (
                    <Crown size={14} className="ml-1 text-discord-yellow" />
                  )}
                  
                  {!member.isOwner && group.name !== '@everyone' && group.name !== 'online' && (
                    <Shield size={14} className="ml-1" style={{ color: group.color || '#99aab5' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
