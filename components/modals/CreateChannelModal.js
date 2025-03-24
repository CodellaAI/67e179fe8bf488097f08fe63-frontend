
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Hash } from 'lucide-react'

export default function CreateChannelModal({ guildId, onClose, onChannelCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/channels`, 
        {
          name: data.name,
          topic: data.topic,
          category: data.category || 'general'
        },
        { withCredentials: true }
      )
      
      toast.success('Channel created successfully!')
      onChannelCreated(response.data)
      onClose()
    } catch (error) {
      console.error('Failed to create channel:', error)
      toast.error(error.response?.data?.message || 'Failed to create channel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Channel</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              CHANNEL NAME
            </label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-3 text-discord-gray-muted" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="new-channel"
                {...register('name', { 
                  required: 'Channel name is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Channel name can only contain lowercase letters, numbers, and hyphens'
                  },
                  minLength: {
                    value: 2,
                    message: 'Channel name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 32,
                    message: 'Channel name must be less than 32 characters'
                  }
                })}
              />
            </div>
            {errors.name && (
              <p className="text-discord-red text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              CHANNEL TOPIC (OPTIONAL)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter a topic"
              {...register('topic', { 
                maxLength: {
                  value: 1024,
                  message: 'Channel topic must be less than 1024 characters'
                }
              })}
            />
            {errors.topic && (
              <p className="text-discord-red text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              CATEGORY (OPTIONAL)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="general"
              {...register('category')}
            />
            <p className="text-discord-gray-muted text-xs mt-1">
              Leave empty to use 'general' category
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
              {isLoading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
