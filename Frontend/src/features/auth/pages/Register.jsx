import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSeo } from '../../../shared/seo/useSeo'

const Register = () => {
    useSeo({
        title: "Create Account",
        description: "Create your Resume Analyzer AI account and get AI-powered resume optimization, skill-gap analysis, and interview preparation plans.",
        canonicalPath: "/register",
        keywords: ["create resume ai account", "resume optimizer", "AI interview preparation", "resume analysis tool"],
        robots: "index,follow",
        ogType: "website",
    })

    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await handleRegister({ username, email, password })
            navigate('/')
        } catch (error) {
            // Keep user on register page when registration fails.
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111c2d] border-t-transparent" />
                    <div>
                        <p className="text-2xl font-extrabold tracking-tight text-[#191c1e]">Creating Your Account</p>
                        <p className="mt-2 text-sm text-[#45464d]">Please wait while we prepare your workspace.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex min-h-screen w-full flex-col overflow-y-auto bg-[#f7f9fb] text-[#191c1e] md:max-h-screen md:flex-row md:overflow-hidden">
            <section className="relative flex h-64 w-full shrink-0 items-end overflow-hidden sm:h-72 md:h-screen md:max-h-screen md:w-[60%]">
                <div className="absolute inset-0 z-0">
                    <img
                        className="h-full w-full object-cover"
                        alt="Modern minimalist workspace with a laptop displaying a professional resume draft"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaBfncQVr_xVd6F8LjgGFu4NpPS_ibvi7ExC-JpoUKXtZ0TzCVNHYz4ygsgsCKUm92p4mZ73GA_B6ztk6KqQ6PRi4enM7hZGmNcQCddhKpZwvV90BAs5cXzlFHpbtht8Nho3yw1tOtpBrQcLWeyO2hqSotfCDPqonqfIsmqaq6oLTVhFvWJk99ug18I8sNcp67FTKigmBCZ_aMwnkFx_j2QWIfJTeeRBFEWGdmMzhFsBe2ZAr6uhIyiuQUapf0cEiOk8JQ-pfOZg"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#111c2d] via-[#111c2d]/40 to-transparent" />
                </div>

                <div className="relative z-10 mb-4 w-full p-6 sm:p-8 md:mb-6 md:p-12 lg:p-14">
                    <div className="mb-6 md:mb-10">
                        <span className="text-xl font-bold tracking-tight text-[#79849a]">ResumeAI</span>
                    </div>
                    <h1 className="mb-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:mb-4 md:text-5xl">
                        Your Career, Elevated by AI
                    </h1>
                    <p className="max-w-xl text-sm leading-relaxed text-[#79849a] opacity-90 sm:text-base md:text-lg">
                        Architectural precision in career growth. Leverage neural networks to engineer a professional
                        narrative that commands attention.
                    </p>
                </div>
            </section>

            <section className="flex w-full flex-1 flex-col justify-center bg-[#f2f4f6] px-6 py-8 sm:px-8 md:max-h-screen md:w-[40%] md:overflow-y-auto md:px-12 md:py-6 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    <header className="mb-6 md:mb-7">
                        <h2 className="mb-2 text-[1.75rem] font-bold tracking-tight text-black sm:text-3xl">Create Your Account</h2>
                        <p className="text-sm font-medium text-[#45464d]">Start building your professional future today.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <div className="space-y-1.5">
                            <label
                                className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#45464d]"
                                htmlFor="fullname"
                            >
                                Full Name
                            </label>
                            <input
                                className="w-full rounded-md bg-[#e0e3e5] px-4 py-3 text-sm text-[#191c1e] outline-2 outline-transparent transition-all duration-200 placeholder:text-[#76777d]/60 focus:bg-white focus:outline-[#008cc7]/30"
                                id="fullname"
                                name="fullname"
                                placeholder="Alexander Sterling"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#45464d]"
                                htmlFor="email"
                            >
                                Email Address
                            </label>
                            <input
                                className="w-full rounded-md bg-[#e0e3e5] px-4 py-3 text-sm text-[#191c1e] outline-2 outline-transparent transition-all duration-200 placeholder:text-[#76777d]/60 focus:bg-white focus:outline-[#008cc7]/30"
                                id="email"
                                name="email"
                                placeholder="alexander@corporate.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#45464d]"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full rounded-md bg-[#e0e3e5] px-4 py-3 text-sm text-[#191c1e] outline-2 outline-transparent transition-all duration-200 placeholder:text-[#76777d]/60 focus:bg-white focus:outline-[#008cc7]/30"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                className="relative w-full overflow-hidden rounded-md bg-[#111c2d] py-3.5 text-sm font-bold tracking-wide text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                style={{ boxShadow: '0px 20px 40px rgba(25, 28, 30, 0.06)' }}
                                type="submit"
                                disabled={loading}
                            >
                                <span className="absolute inset-0 bg-white/5 opacity-0 transition-opacity hover:opacity-100" />
                                <span className="relative">Create Your Account</span>
                            </button>
                        </div>
                    </form>

                    <footer className="mt-6 space-y-5 md:mt-7">
                        <div className="text-center">
                            <p className="text-sm font-medium text-[#45464d]">
                                Already have an account?
                                <Link to="/login" className="ml-1 font-semibold text-[#008cc7] transition-colors hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 rounded-lg bg-[#eceef0]/50 py-3">
                            <span
                                className="material-symbols-outlined text-lg text-[#008cc7]"
                                style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}
                            >
                                lock
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3c475a]">
                                Encrypted &amp; Secure
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#76777d]">
                            <a className="transition-colors hover:text-black" href="#">
                                Privacy
                            </a>
                            <a className="transition-colors hover:text-black" href="#">
                                Terms
                            </a>
                            <a className="transition-colors hover:text-black" href="#">
                                Compliance
                            </a>
                        </div>
                    </footer>
                </div>
            </section>
        </main>
    )
}

export default Register
