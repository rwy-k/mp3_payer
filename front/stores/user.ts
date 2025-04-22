import { defineStore } from 'pinia'
import { ref } from 'vue'

// You might want to create this type in a separate file
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Helper functions for storage access
  const setStorageItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value)
    }
  }

  const getStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key)
    }
    return null
  }

  const removeStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userFullName = computed(() => user.value ? user.value.name : '')
  
  // Actions
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      // Replace with your actual API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) throw new Error('Login failed')
      
      const data = await response.json()
      user.value = data.user
      token.value = data.token
      
      // Store token in localStorage safely
      setStorageItem('token', data.token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }
  
  function logout() {
    user.value = null
    token.value = null
    removeStorageItem('token')
    // Additional cleanup as needed
  }
  
  async function fetchUserProfile() {
    if (!token.value) return
    
    loading.value = true
    try {
      // Replace with your actual API call
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      user.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }
  
  // Initialize store (check for existing session)
  function init() {
    const savedToken = getStorageItem('token')
    if (savedToken) {
      token.value = savedToken
      fetchUserProfile()
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isLoggedIn,
    userFullName,
    
    // Actions
    login,
    logout,
    fetchUserProfile,
    init
  }
})
