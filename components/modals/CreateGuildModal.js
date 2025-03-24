
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Upload } from 'lucide-react'

export default function CreateGuildModal({ onClose, onGuildCreated }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.icon && data.icon.length > 0) {
      formData.append('icon', data.icon[0])
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      )
      
      toast.success('Server created successfully!')
      onGuildCreated(response.data)
      onClose()
    } catch (error) {
      console.error('Failed to create server:', error)
      toast.error(error.response?.data?.message || 'Failed to create server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create a Server</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full bg-discord-gray-dark flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Server icon preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-discord-gray-muted" />
              )}
              <input
                type="file"
                id="icon"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                {...register('icon')}
                onChange={handleImageChange}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-discord-gray-text mb-1">
              SERVER NAME
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter server name"
              {...register('name', { 
                required: 'Server name is required',
                minLength: {
                  value: 2,
                  message: 'Server name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Server name must be less than 100 characters'
                }
              })}
            />
            {errors.name && (
              <p className="text-discord-red text-sm mt-1">{errors.name.message}</p>
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
              disabled={isLoading}
              className="button-primary"
            >
              {isLoading ? 'Creating...' : 'Create Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
