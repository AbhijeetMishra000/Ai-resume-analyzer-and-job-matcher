import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSeo } from '../../../shared/seo/useSeo'

const Login = () => {
    useSeo({
        title: "Login",
        description: "Sign in to Resume Analyzer AI to analyze your resume, improve role match scores, and prepare smarter for interviews.",
        canonicalPath: "/login",
        keywords: ["resume analyzer login", "AI resume checker", "interview prep AI", "resume match score"],
        robots: "index,follow",
        ogType: "website",
    })

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await handleLogin({ email, password })
            navigate('/')
        } catch (error) {
            // Keep user on login page when authentication fails.
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-4xl bg-white px-8 py-10 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111c2d] border-t-transparent" />
                    <div>
                        <p className="font-display text-2xl font-bold text-[#191c1e]">Welcome Back</p>
                        <p className="mt-2 text-sm text-[#45464d]">Please wait while we restore your workspace.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex min-h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#d0e1fb] md:max-h-screen md:flex-row md:overflow-y-hidden">
            <section className="relative flex h-64 w-full min-w-0 shrink-0 items-end overflow-hidden sm:h-72 md:h-screen md:w-[60%] md:flex-none">
                <div className="absolute inset-0 z-10 bg-[#111c2d]/20 mix-blend-multiply" />
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRhL9khKYawvOG14QbTAhOv4Vhf7eFFc_SS1qqK3r1PzKBb6K8Rv3y7qd4pDlGXAkavaphttP8_9t0zB-iCbxvSRJvTAzQSCCySCbbGSN01PywxbthawkHgnt08-MYnUbSBnVjm1RGD7mOzUIHHZ7HOA8EfH1HsnBus-xjTK0KqenVq19WBTk-MeMNmSWcQ4t_Jvo7dJCHgIRVMn4zbFrWrT3hbiG01O5SwjOjnr4V5JzBeVCXdRyEx7RlzgpqZvCCP09P1f9zYQ"
                    alt="Modern professional office interior"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 z-20 bg-linear-to-tr from-[#111c2d] via-transparent to-transparent opacity-60" />

                <div className="relative z-30 w-full p-6 sm:p-8 md:absolute md:bottom-24 md:left-12 md:max-w-xl md:p-0">
                    <Link
                        to="/"
                        className="mb-6 inline-block text-2xl font-bold tracking-wider text-white sm:text-3xl md:mb-8 md:text-4xl"
                    >
                        Resume Analyzer
                    </Link>
                    <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:mb-4 md:text-6xl">
                        AI-Powered <br /> Resume Builder
                    </h1>
                    <p className="max-w-md text-sm leading-relaxed text-[#bcc7de] sm:text-base md:text-lg md:font-light">
                        Craft your professional future with AI-driven precision and sophisticated design. Your career,
                        elevated.
                    </p>
                </div>
            </section>

            <section className="relative flex w-full min-w-0 flex-1 items-center justify-center bg-[#f7f9fb] px-6 py-8 sm:px-8 md:w-[40%] md:flex-none md:overflow-y-auto md:px-10 md:py-6 lg:px-12">
                <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 -translate-y-1/4 rounded-full bg-[#f2f4f6] opacity-60 blur-3xl sm:h-56 sm:w-56 md:h-64 md:w-64 md:-translate-y-1/3" />

                <div className="relative z-10 w-full max-w-md">
                    <div className="mb-8 md:mb-10">
                        <h2 className="mb-2 text-center text-[1.75rem] font-bold tracking-tight text-[#191c1e] sm:text-3xl">
                            Welcome Back
                        </h2>
                        <p className="text-center font-medium text-[#45464d]">
                            Please enter your credentials to access your secure workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold uppercase tracking-[0.2em] text-[#45464d]"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-md border-none bg-[#e0e3e5] px-4 py-3 text-[#191c1e] outline-none transition-all placeholder:text-[#76777d] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30 md:py-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-[#45464d]"
                                >
                                    Password
                                </label>
                                {/* <a
                                    className="text-xs font-semibold text-[#004c6e] underline-offset-4 hover:underline"
                                    href="#"
                                >
                                    Forgot Password?
                                </a> */}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-md border-none bg-[#e0e3e5] px-4 py-3 text-[#191c1e] outline-none transition-all placeholder:text-[#76777d] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30 md:py-4"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#111c2d] py-3.5 font-semibold text-white shadow-[0_20px_40px_rgba(25,28,30,0.06)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 md:py-4"
                            >
                                <span>Sign In</span>
                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center md:mt-10">
                        <p className="text-[#45464d]">
                            Don&apos;t have an account?
                            <Link
                                to="/register"
                                className="ml-1 font-bold text-black underline-offset-4 hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    <div className="mx-auto mt-6 flex w-fit items-center justify-center gap-3 rounded-full bg-[#f2f4f6] px-4 py-3 md:mt-8">
                        <span
                            className="material-symbols-outlined text-sm text-[#008cc7]"
                            style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}
                        >
                            verified_user
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#004c6e]">
                            Encrypted Session
                        </span>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Login
