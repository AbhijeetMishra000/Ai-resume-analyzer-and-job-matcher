import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if(loading){
        return (
            <main className="flex min-h-screen items-center justify-center px-6">
                <div className="glass-panel flex w-full max-w-sm flex-col items-center gap-4 rounded-4xl px-8 py-10 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/40 border-t-cyan-500" />
                    <div>
                        <h1 className="font-display text-2xl font-bold text-white">Checking your session</h1>
                        <p className="mt-2 text-sm text-slate-300">We are making sure your workspace is ready.</p>
                    </div>
                </div>
            </main>
        )
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
    
    return children
}

export default Protected
