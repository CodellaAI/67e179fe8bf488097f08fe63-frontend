
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X } from 'lucide-react'

export default function JoinGuildModal({ onClose, onGuildJoined }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invites/join`, 
        { inviteCode: data.inviteCode },
        { withCredentials: true }
      )
      
      toast.success('Joined server successfully!')
      onGuildJoined(response.data)
      onClose()
    } catch (error) {
      console.error('Failed to join server:', error)
      toast.error(error.response?.data?.message || 'Failed to join server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Join a Server</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              INVITE CODE
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter an invite code"
              {...register('inviteCode', { 
                required: 'Invite code is required',
                pattern: {
                  value: /^[a-zA-Z0-9]{6,}$/,
                  message: 'Invalid invite code format'
                }
              })}
            />
            {errors.inviteCode && (
              <p className="text-discord-red text-sm mt-1">{errors.inviteCode.message}</p>
            )}
            <p className="text-discord-gray-muted text-xs mt-1">
              Invite codes look like: AbCdEf
            </p>
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
              disabled={isLoading}
              className="button-primary"
            >
              {isLoading ? 'Joining...' : 'Join Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
