
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { X, Copy, RefreshCw } from 'lucide-react'

export default function InviteModal({ guild, onClose }) {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateInvite()
  }, [])

  const generateInvite = async () => {
    setIsGenerating(true)
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guild._id}/invites`,
        {},
        { withCredentials: true }
      )
      
      setInviteCode(response.data.code)
      setInviteLink(`${window.location.origin}/invite/${response.data.code}`)
    } catch (error) {
      console.error('Failed to generate invite:', error)
      toast.error('Failed to generate invite link')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard!')
  }

  return (
    <div className="modal-container">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invite People to {guild.name}</h2>
          <button onClick={onClose} className="text-discord-gray-muted hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-discord-gray-text mb-2">
            Share this link with others to grant access to this server
          </p>
          
          <div className="flex">
            <input
              type="text"
              className="input-field flex-1 rounded-r-none"
              value={inviteLink}
              readOnly
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="bg-discord-primary px-3 rounded-r hover:bg-opacity-80"
              title="Copy invite link"
            >
              <Copy size={18} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-discord-gray-muted">
              {inviteCode ? `Invite code: ${inviteCode}` : 'Generating code...'}
            </span>
            
            <button
              type="button"
              onClick={generateInvite}
              disabled={isGenerating}
              className="text-discord-primary text-sm flex items-center hover:underline"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="mr-1" />
                  Generate New Link
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-discord-gray-dark p-3 rounded text-sm">
          <p className="text-discord-gray-text">
            Your invite link expires in 7 days. Create a new link anytime by clicking "Generate New Link".
          </p>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="button-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
