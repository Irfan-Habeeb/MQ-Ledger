'use client'

import { useEffect, useState } from 'react'
import { Dashboard } from '@/components/dashboard'
import { Login } from '@/components/login'
import { getCurrentUser, isUserAuthorized } from '@/lib/auth'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user && isUserAuthorized(user.email)) {
          setIsAuthenticated(true)
          setError(null)
          setUnauthorizedEmail(null)
        } else {
          setIsAuthenticated(false)
          setError(null)
        }
      } catch (error: unknown) {
        console.error('Auth check error:', error)
        if (error instanceof Error && error.message === 'UNAUTHORIZED_USER') {
          setError('UNAUTHORIZED_USER')
          setUnauthorizedEmail((error as { email?: string }).email || 'Unknown email')
        } else if (error instanceof Error && error.message.includes('Auth session missing')) {
          // This is normal when no user is signed in
          setIsAuthenticated(false)
          setError(null)
        } else {
          setError('Failed to check authentication')
          setIsAuthenticated(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#cedce7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait while we check your authentication</p>
        </div>
      </div>
    )
  }

  if (error === 'UNAUTHORIZED_USER') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#cedce7' }}>
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
              <span style={{ color: '#344e80' }}>MENTORS</span>
              <span style={{ color: '#43a24c' }}>CUE</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                The email address <strong>{unauthorizedEmail}</strong> is not authorized to access this dashboard.
              </p>
              <p className="text-sm text-gray-500">
                Please contact the administrator if you believe this is an error.
              </p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Different Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#cedce7' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <Dashboard />
}
