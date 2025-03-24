
'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function GuildChannelsRedirect() {
  const router = useRouter()
  const params = useParams()
  const { guildId } = params
  
  useEffect(() => {
    // Handle the special case for Direct Messages
    if (guildId === '@me') {
      // Already in the correct route, no need to redirect
      return
    }

    // Redirect to the new guild route structure
    router.push(`/guilds/${guildId}`)
  }, [guildId, router])

  return <LoadingScreen />
}
