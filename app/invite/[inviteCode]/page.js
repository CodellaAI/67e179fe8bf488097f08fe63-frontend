
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import LoadingScreen from '@/components/LoadingScreen'
import Image from 'next/image'

export default function InvitePage() {
  const router = useRouter()
  const params = useParams()
  const { inviteCode } = params
  
  const [guild, setGuild] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        if (!inviteCode) return
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invites/${inviteCode}/details`,
          { withCredentials: true }
        )
        
        setGuild(response.data.guild)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch invite details:', error)
        setError(error.response?.data?.message || 'Invalid invite link')
        setIsLoading(false)
      }
    }

    fetchInviteDetails()
  }, [inviteCode])

  const handleJoinGuild = async () => {
    try {
      setIsJoining(true)
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invites/join`,
        { inviteCode },
        { withCredentials: true }
      )
      
      toast.success(`Joined ${response.data.name}!`)
      router.push(`/channels/${response.data._id}`)
    } catch (error) {
      console.error('Failed to join guild:', error)
      toast.error(error.response?.data?.message || 'Failed to join server')
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-discord-dark">
        <div className="bg-discord-gray-light p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Invalid Invite</h2>
          <p className="text-discord-gray-text text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => router.push('/channels/@me')}
              className="button-primary"
            >
              Return to Discord
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen bg-discord-dark">
      <div className="bg-discord-gray-light p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center mb-6">
          {guild.icon ? (
            <Image 
              src={guild.icon} 
              alt={guild.name} 
              width={80} 
              height={80} 
              className="rounded-full mr-4"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-discord-primary flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">
                {guild.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{guild.name}</h2>
            <p className="text-discord-gray-text">
              {guild.memberCount || 0} {guild.memberCount === 1 ? 'Member' : 'Members'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleJoinGuild}
          disabled={isJoining}
          className="button-primary w-full py-3 mb-4"
        >
          {isJoining ? 'Joining...' : `Join ${guild.name}`}
        </button>
        
        <div className="text-center">
          <button 
            onClick={() => router.push('/channels/@me')}
            className="text-discord-gray-text hover:underline"
          >
            Return to Discord
          </button>
        </div>
      </div>
    </div>
  )
}
