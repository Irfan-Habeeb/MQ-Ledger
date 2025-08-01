'use client'

import { useEffect, useState } from 'react'
import { Dashboard } from '@/components/dashboard'
import { Login } from '@/components/login'
import { getCurrentUser, isUserAuthorized } from '@/lib/auth'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user && isUserAuthorized(user.email)) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setError('Failed to check authentication')
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait while we check your authentication</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-500">Debug: If you see this styled, Tailwind is working!</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Debug section - remove this after we fix the styling
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-8">Debug: Authentication Required</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tailwind Test</h2>
              <div className="space-y-2">
                <div className="bg-blue-600 text-white p-3 rounded">Blue 600</div>
                <div className="bg-green-600 text-white p-3 rounded">Green 600</div>
                <div className="bg-red-600 text-white p-3 rounded">Red 600</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CSS Variables Test</h2>
              <div className="space-y-2">
                <div className="bg-background text-foreground p-3 rounded border">Background</div>
                <div className="bg-card text-card-foreground p-3 rounded border">Card</div>
                <div className="bg-primary text-primary-foreground p-3 rounded">Primary</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Login />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <Dashboard />
}
