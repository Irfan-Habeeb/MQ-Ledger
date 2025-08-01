'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

// Force dynamic rendering to avoid build-time environment variable issues
export const dynamic = 'force-dynamic'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabaseClient = getSupabaseClient()
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
          return
        }

        if (session?.user) {
          // Check if user is authorized
          const email = session.user.email
          if (email) {
            // For now, allow all users with valid Google accounts
            // You can add authorization logic here
            router.push('/')
          } else {
            router.push('/?error=unauthorized')
          }
        } else {
          router.push('/?error=no_session')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Sign In
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  )
}