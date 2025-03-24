
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LoadingScreen from '@/components/LoadingScreen'
import GuildSidebar from '@/components/navigation/GuildSidebar'

export default function ChannelsLayout({ children }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen">
      <GuildSidebar />
      {children}
    </div>
  )
}
