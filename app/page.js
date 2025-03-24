
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/channels/@me')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return <LoadingScreen />
}
