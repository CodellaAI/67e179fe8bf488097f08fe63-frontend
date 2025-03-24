
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function GuildSettingsModal({ guild, onClose }) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: guild.name
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(guild.icon || null)
  const [activeTab, setActiveTab] = useState('overview')
  const [roles, setRoles] = useState(guild.roles || [])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guild._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      )
      
      toast.success('Server updated successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to update server:', error)
      toast.error(error.response?.data?.message || 'Failed to update server')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGuild = async () => {
    setIsLoading(true)
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guild._id}`,
        { withCredentials: true }
      )
      
      toast.success('Server deleted successfully!')
      onClose()
      window.location.href = '/channels/@me'
    } catch (error) {
      console.error('Failed to delete server:', error)
      toast.error(error.response?.data?.message || 'Failed to delete server')
    } finally {
      setIsLoading(false)
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="bg-discord-gray-light rounded-md w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-discord-gray-dark p-4">
          <h2 className="font-bold text-white mb-4">{guild.name}</h2>
          
          <ul className="space-y-1">
            <li>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${
                  activeTab === 'overview' 
                    ? 'bg-discord-gray-lighter text-white' 
                    : 'text-discord-gray-text hover:bg-discord-gray-lighter hover:bg-opacity-50'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${
                  activeTab === 'roles' 
                    ? 'bg-discord-gray-lighter text-white' 
                    : 'text-discord-gray-text hover:bg-discord-gray-lighter hover:bg-opacity-50'
                }`}
                onClick={() => setActiveTab('roles')}
              >
                Roles
              </button>
            </li>
          </ul>
          
          <div className="mt-auto pt-4 border-t border-discord-gray-lighter border-opacity-50">
            <button 
              className="w-full text-left px-2 py-1 rounded text-discord-red hover:bg-discord-red hover:bg-opacity-10"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Server
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {activeTab === 'overview' ? 'Server Overview' : 'Server Roles'}
            </h2>
            <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          {activeTab === 'overview' && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-discord-gray-text mb-1">
                  SERVER NAME
                </label>
                <input
                  type="text"
                  className="input-field"
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
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-discord-gray-text mb-1">
                  SERVER ICON
                </label>
                <div className="flex items-center">
                  <div className="relative w-24 h-24 rounded-full bg-discord-gray-dark flex items-center justify-center overflow-hidden mr-4">
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
                  <div>
                    <p className="text-sm text-discord-gray-text mb-2">
                      We recommend an image of at least 512x512 for the server.
                    </p>
                    <button
                      type="button"
                      className="text-sm text-discord-primary hover:underline"
                      onClick={() => document.getElementById('icon').click()}
                    >
                      Upload Image
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button-primary"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
          
          {activeTab === 'roles' && (
            <div>
              <div className="bg-discord-gray-dark p-4 rounded mb-4">
                <p className="text-discord-gray-text">
                  Use roles to organize your server members and customize their permissions.
                </p>
              </div>
              
              <div className="space-y-2">
                {roles.map(role => (
                  <div 
                    key={role._id} 
                    className="flex items-center justify-between bg-discord-gray-dark p-3 rounded"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: role.color || '#99aab5' }}
                      ></div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <div className="text-xs text-discord-gray-muted">
                      {role.members.length} members
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 button-primary">
                Create Role
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-container">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-discord-red">Delete Server</h2>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="text-discord-gray-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-discord-gray-text mb-4">
              Are you sure you want to delete <strong>{guild.name}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-discord-gray-dark text-white rounded hover:bg-opacity-80"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={deleteGuild}
                className="px-4 py-2 bg-discord-red text-white rounded hover:bg-opacity-80"
              >
                {isLoading ? 'Deleting...' : 'Delete Server'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
