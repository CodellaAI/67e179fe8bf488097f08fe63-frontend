
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Upload, LogOut } from 'lucide-react'
import Image from 'next/image'

export default function UserSettingsModal({ user, onClose, onLogout }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user.username,
      email: user.email
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(user.avatar || null)
  const [activeTab, setActiveTab] = useState('account')

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
    formData.append('username', data.username)
    formData.append('email', data.email)
    if (data.password) {
      formData.append('password', data.password)
    }
    if (data.avatar && data.avatar.length > 0) {
      formData.append('avatar', data.avatar[0])
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      )
      
      toast.success('Profile updated successfully!')
      onClose()
      // Refresh the page to update user data
      window.location.reload()
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-container">
      <div className="bg-discord-gray-light rounded-md w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-discord-gray-dark p-4">
          <h2 className="font-bold text-white mb-4">User Settings</h2>
          
          <ul className="space-y-1">
            <li>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${
                  activeTab === 'account' 
                    ? 'bg-discord-gray-lighter text-white' 
                    : 'text-discord-gray-text hover:bg-discord-gray-lighter hover:bg-opacity-50'
                }`}
                onClick={() => setActiveTab('account')}
              >
                My Account
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-2 py-1 rounded ${
                  activeTab === 'profile' 
                    ? 'bg-discord-gray-lighter text-white' 
                    : 'text-discord-gray-text hover:bg-discord-gray-lighter hover:bg-opacity-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                User Profile
              </button>
            </li>
          </ul>
          
          <div className="mt-auto pt-4 border-t border-discord-gray-lighter border-opacity-50">
            <button 
              className="w-full text-left px-2 py-1 rounded text-discord-red hover:bg-discord-red hover:bg-opacity-10 flex items-center"
              onClick={onLogout}
            >
              <LogOut size={16} className="mr-2" />
              Log Out
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {activeTab === 'account' ? 'My Account' : 'User Profile'}
            </h2>
            <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'account' && (
              <div>
                <div className="bg-discord-gray-dark rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mr-4">
                      <Image
                        src={previewImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <input
                          type="file"
                          id="avatar"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          {...register('avatar')}
                          onChange={handleImageChange}
                        />
                        <Upload size={24} className="text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-white">{user.username}</h3>
                      <button
                        type="button"
                        className="text-discord-primary text-sm hover:underline mt-1"
                        onClick={() => document.getElementById('avatar').click()}
                      >
                        Change Avatar
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-discord-gray-text mb-1">
                      USERNAME
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('username', { 
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters'
                        },
                        maxLength: {
                          value: 32,
                          message: 'Username must be less than 32 characters'
                        }
                      })}
                    />
                    {errors.username && (
                      <p className="text-discord-red text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-discord-gray-text mb-1">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-discord-red text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-discord-gray-text mb-1">
                      CURRENT PASSWORD
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      {...register('currentPassword')}
                      placeholder="Enter current password to confirm changes"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-discord-gray-text mb-1">
                    ABOUT ME
                  </label>
                  <textarea
                    className="input-field min-h-[100px]"
                    placeholder="Tell us about yourself"
                    {...register('bio')}
                  ></textarea>
                  <p className="text-xs text-discord-gray-muted mt-1">
                    You can use markdown and links if you'd like.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-discord-gray-text mb-1">
                    CUSTOM STATUS
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Set a custom status"
                    {...register('status')}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-discord-gray-dark text-white rounded hover:bg-opacity-80 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="button-primary"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
