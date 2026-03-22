import axios, { AxiosInstance } from 'axios'
import { supabase } from './supabase'

class APIClient {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add interceptor to include auth token in requests
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const { data } = await supabase.auth.getSession()
          if (data?.session?.access_token) {
            config.headers.Authorization = `Bearer ${data.session.access_token}`
          }
        } catch (error) {
          console.error('[v0] Error getting session token:', error)
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, refresh and retry
          try {
            const { data, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) throw refreshError

            if (data?.session?.access_token) {
              error.config.headers.Authorization = `Bearer ${data.session.access_token}`
              return this.client(error.config)
            }
          } catch (refreshError) {
            console.error('[v0] Token refresh failed:', refreshError)
            // Redirect to login if needed
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(endpoint: string, config?: any) {
    return this.client.get<T>(endpoint, config)
  }

  async post<T>(endpoint: string, data?: any, config?: any) {
    return this.client.post<T>(endpoint, data, config)
  }

  async put<T>(endpoint: string, data?: any, config?: any) {
    return this.client.put<T>(endpoint, data, config)
  }

  async patch<T>(endpoint: string, data?: any, config?: any) {
    return this.client.patch<T>(endpoint, data, config)
  }

  async delete<T>(endpoint: string, config?: any) {
    return this.client.delete<T>(endpoint, config)
  }
}

export const apiClient = new APIClient()
