import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

// Authorized users for shared accounting access
export const AUTHORIZED_USERS = [
  'mentorscue@gmail.com',
  // Add more users here as needed
]

export const isUserAuthorized = (email: string): boolean => {
  return AUTHORIZED_USERS.includes(email)
}

export const isUserAdmin = (email: string): boolean => {
  return email === 'mentorscue@gmail.com'
}

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
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
    return null
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
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