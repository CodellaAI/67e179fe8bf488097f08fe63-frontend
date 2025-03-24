
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Search, UserPlus } from 'lucide-react'
import Image from 'next/image'

export default function NewDMModal({ onClose, onDMCreated }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        { withCredentials: true }
      )
      
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const createDM = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations`,
        { recipient: userId },
        { withCredentials: true }
      )
      
      toast.success('Conversation started!')
      onDMCreated(response.data)
      onClose()
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error(error.response?.data?.message || 'Failed to start conversation')
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Direct Message</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-discord-gray-muted" />
            <input
              type="text"
              placeholder="Type the username of a friend"
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-discord-primary"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-1">
              {filteredUsers.map(user => (
                <div 
                  key={user._id}
                  className="flex items-center justify-between p-2 rounded hover:bg-discord-gray-dark cursor-pointer"
                  onClick={() => createDM(user._id)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Image
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-gray-light ${
                        user.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                      }`}></div>
                    </div>
                    
                    <div className="ml-3">
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </div>
                  
                  <button className="text-discord-gray-muted hover:text-white">
                    <UserPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-discord-gray-muted">
              {searchTerm ? 'No users found' : 'Start typing to find users'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
