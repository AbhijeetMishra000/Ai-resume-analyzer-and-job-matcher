import axios from "axios"

const trimTrailingSlash = (value = "") => value.trim().replace(/\/+$/, "")
const AUTH_TOKEN_KEY = "resume_ai_token"

const resolveApiBaseUrl = () => {
    const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "")
    if (configuredUrl) {
        return configuredUrl
    }

    if (typeof window !== "undefined") {
        const { origin, hostname, port, protocol } = window.location
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1"

        if (isLocalhost) {
            return `${protocol}//${hostname}:3000`
        }

        if (port === "5173") {
            return `${protocol}//${hostname}:3000`
        }

        return origin
    }

    return "http://localhost:3000"
}

export const API_BASE_URL = resolveApiBaseUrl()
export const getAuthToken = () => {
    if (typeof window === "undefined") {
        return null
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY)
}
export const setAuthToken = (token) => {
    if (typeof window === "undefined") {
        return
    }

    if (!token) {
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
        return
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}
export const clearAuthToken = () => setAuthToken(null)

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

export default apiClient
