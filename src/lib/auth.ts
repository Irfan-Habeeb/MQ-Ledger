import { getSupabaseClient } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

interface UnauthorizedError extends Error {
  email?: string
}

// Authorized users for shared accounting access
// You can add users in two ways:
// 1. Add them to the array below
// 2. Set the AUTHORIZED_USERS environment variable (comma-separated emails)
const HARDCODED_USERS = [
  'mentorscue@gmail.com',
  // Add more users here as needed
]

const ENV_USERS = process.env.NEXT_PUBLIC_AUTHORIZED_USERS?.split(',').map(email => email.trim()) || []

export const AUTHORIZED_USERS = [...HARDCODED_USERS, ...ENV_USERS]

export const isUserAuthorized = (email: string): boolean => {
  return AUTHORIZED_USERS.includes(email)
}

export const isUserAdmin = (email: string): boolean => {
  return email === 'mentorscue@gmail.com'
}

export const signInWithGoogle = async () => {
  try {
    const supabaseClient = getSupabaseClient()
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const supabaseClient = getSupabaseClient()
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const supabaseClient = getSupabaseClient()
    
    // First check if there's an active session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      return null
    }
    
    if (!session) {
      console.log('No active session found')
      return null
    }
    
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    if (user) {
      // Check if user is authorized
      if (!isUserAuthorized(user.email!)) {
        // Sign out unauthorized user
        await supabaseClient.auth.signOut()
        const unauthorizedError = new Error('UNAUTHORIZED_USER') as UnauthorizedError
        unauthorizedError.email = user.email
        throw unauthorizedError
      }
      
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    // Don't re-throw session-related errors, just return null
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      return null
    }
    throw error
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const supabaseClient = getSupabaseClient()
  return supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Check if user is authorized
      if (!isUserAuthorized(session.user.email!)) {
        // Sign out unauthorized user
        await supabaseClient.auth.signOut()
        callback(null)
        return
      }
      
      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name,
        avatar_url: session.user.user_metadata?.avatar_url
      }
      callback(user)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}