
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Search, MoreVertical, UserMinus, Shield, Crown } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'

export default function MembersModal({ guild, onClose }) {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guild._id}/members`,
        { withCredentials: true }
      )
      
      setMembers(response.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
      toast.error('Failed to load server members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMenu = (member, e) => {
    e.preventDefault()
    setSelectedMember(member)
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  const handleCloseMenu = () => {
    setShowMenu(false)
    setSelectedMember(null)
  }

  const handleKickMember = async (memberId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guild._id}/members/${memberId}`,
        { withCredentials: true }
      )
      
      toast.success('Member kicked from server')
      setMembers(prev => prev.filter(m => m._id !== memberId))
    } catch (error) {
      console.error('Failed to kick member:', error)
      toast.error(error.response?.data?.message || 'Failed to kick member')
    } finally {
      handleCloseMenu()
    }
  }

  const isAdmin = guild?.roles?.some(role => 
    role.members.includes(user?._id) && role.permissions.includes('ADMINISTRATOR')
  )

  const isOwner = guild?.owner === user?._id

  const getMemberRoles = (memberId) => {
    return guild?.roles?.filter(role => role.members.includes(memberId)) || []
  }

  const getHighestRole = (memberId) => {
    const roles = getMemberRoles(memberId)
    if (roles.length === 0) return null
    
    // Sort roles by position (higher position = more important)
    return roles.sort((a, b) => b.position - a.position)[0]
  }

  const filteredMembers = members.filter(member => 
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort members: owner first, then by role position
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (a._id === guild?.owner) return -1
    if (b._id === guild?.owner) return 1
    
    const aRole = getHighestRole(a._id)
    const bRole = getHighestRole(b._id)
    
    if (!aRole && !bRole) return 0
    if (!aRole) return 1
    if (!bRole) return -1
    
    return bRole.position - aRole.position
  })

  return (
    <div className="modal-container">
      <div className="bg-discord-gray-light rounded-md w-full max-w-xl h-[80vh] flex flex-col">
        <div className="p-4 border-b border-discord-gray-dark">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Server Members</h2>
            <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-discord-gray-muted" />
            <input
              type="text"
              placeholder="Search members"
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-discord-primary"></div>
            </div>
          ) : sortedMembers.length > 0 ? (
            <div className="space-y-1">
              {sortedMembers.map(member => {
                const isServerOwner = member._id === guild?.owner
                const memberRoles = getMemberRoles(member._id)
                const highestRole = getHighestRole(member._id)
                
                return (
                  <div 
                    key={member._id}
                    className="flex items-center p-2 rounded hover:bg-discord-gray-dark"
                  >
                    <div className="relative">
                      <Image
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}&background=random`}
                        alt={member.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-gray-light ${
                        member.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                      }`}></div>
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-white">{member.username}</span>
                        {isServerOwner && (
                          <Crown size={14} className="ml-1 text-discord-yellow" />
                        )}
                      </div>
                      
                      {memberRoles.length > 0 && (
                        <div className="flex items-center text-xs text-discord-gray-muted mt-1">
                          {highestRole && (
                            <span 
                              className="px-1.5 py-0.5 rounded" 
                              style={{ 
                                backgroundColor: highestRole.color ? `${highestRole.color}20` : '#36393f',
                                color: highestRole.color || '#99aab5'
                              }}
                            >
                              {highestRole.name}
                            </span>
                          )}
                          {memberRoles.length > 1 && (
                            <span className="ml-1">+{memberRoles.length - 1}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {(isAdmin || isOwner) && member._id !== user?._id && !isServerOwner && (
                      <button
                        onClick={(e) => handleOpenMenu(member, e)}
                        className="text-discord-gray-muted hover:text-white p-1"
                      >
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-discord-gray-muted">
              {searchTerm ? 'No members found' : 'No members in this server'}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-discord-gray-dark">
          <p className="text-sm text-discord-gray-muted">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </p>
        </div>
      </div>
      
      {showMenu && selectedMember && (
        <div 
          className="fixed bg-discord-gray-dark rounded shadow-lg py-1 z-50"
          style={{ 
            top: menuPosition.y, 
            left: menuPosition.x,
            transform: 'translate(-80%, -100%)'
          }}
        >
          <button
            onClick={() => {
              handleKickMember(selectedMember._id)
            }}
            className="w-full text-left px-4 py-2 text-discord-red hover:bg-discord-gray-lighter flex items-center"
          >
            <UserMinus size={16} className="mr-2" />
            Kick Member
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-discord-gray-text hover:bg-discord-gray-lighter flex items-center"
          >
            <Shield size={16} className="mr-2" />
            Manage Roles
          </button>
        </div>
      )}
      
      {showMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={handleCloseMenu}
        ></div>
      )}
    </div>
  )
}
