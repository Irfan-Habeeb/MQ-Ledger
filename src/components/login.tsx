'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/lib/auth'
import { Chrome } from 'lucide-react'

export function Login() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Sign in error:', error)
        alert('Failed to sign in. Please try again.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#cedce7' }}>
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-12">
          <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
            <span style={{ color: '#344e80' }}>MENTORS</span>
            <span style={{ color: '#43a24c' }}>CUE</span>
          </div>
        </div>

        {/* Simple Text */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Sign In Button */}
        <div className="mb-8">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 text-base font-semibold bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Chrome className="h-6 w-6" />
                <span>Continue with Google</span>
              </div>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Secure authentication powered by Google OAuth
          </p>
        </div>
      </div>
    </div>
  )
}