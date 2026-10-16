import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { clearAuthToken, setAuthToken } from "../../../lib/api.client";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data?.token) {
                setAuthToken(data.token)
            }
            setUser(data.user)
            return data
        } catch (err) {
            clearAuthToken()
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data?.token) {
                setAuthToken(data.token)
            }
            setUser(data.user)
            return data
        } catch (err) {
            clearAuthToken()
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            clearAuthToken()
        } catch (err) {
            setUser(null)
            clearAuthToken()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                clearAuthToken()
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
