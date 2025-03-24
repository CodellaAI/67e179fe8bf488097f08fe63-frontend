
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Search, User } from 'lucide-react'
import Image from 'next/image'
import { useSocket } from '@/hooks/useSocket'

export default function NewDMModal({ onClose, onDMCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const { socket } = useSocket()

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([])
        return
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/search?query=${searchTerm}`,
          { withCredentials: true }
        )
        setSearchResults(response.data)
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }

    const timeoutId = setTimeout(searchUsers, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setSearchTerm(user.username)
    setSearchResults([])
  }

  const onSubmit = async () => {
    if (!selectedUser) {
      toast.error('Please select a valid user')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conversations`,
        { recipient: selectedUser._id },
        { withCredentials: true }
      )
      
      // Join the conversation socket room
      if (socket) {
        socket.emit('joinConversation', response.data._id)
      }
      
      toast.success(`Started conversation with ${selectedUser.username}`)
      onDMCreated(response.data)
      onClose()
    } catch (error) {
      console.error('Failed to create DM:', error)
      toast.error(error.response?.data?.message || 'Failed to create conversation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Direct Message</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              SELECT A USER
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-discord-gray-muted" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-2 bg-discord-gray-dark rounded-md overflow-hidden shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center p-3 hover:bg-discord-gray-light cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="relative">
                      <Image
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-dark ${
                        user.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                      }`}></div>
                    </div>
                    <span className="ml-3 text-white">{user.username}</span>
                  </div>
                ))}
              </div>
            )}
            
            {selectedUser && (
              <div className="mt-2 p-3 bg-discord-gray-dark rounded-md">
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.username}&background=random`}
                      alt={selectedUser.username}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-dark ${
                      selectedUser.status === 'online' ? 'bg-discord-green' : 'bg-discord-gray-muted'
                    }`}></div>
                  </div>
                  <span className="ml-3 text-white">{selectedUser.username}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedUser(null)
                      setSearchTerm('')
                    }}
                    className="ml-auto text-discord-gray-muted hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-discord-gray-dark text-white rounded hover:bg-opacity-80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedUser}
              className={`button-primary ${(!selectedUser) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating...' : 'Create DM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
