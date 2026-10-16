import React, { useEffect, useRef, useState } from 'react'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useSeo } from '../../../shared/seo/useSeo.js'

const FALLBACK_QUOTES = [
    { content: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
    { content: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
    { content: "Well done is better than well said.", author: "Benjamin Franklin" },
]

const Home = () => {
    useSeo({
        title: "Resume Match Dashboard",
        description: "Private dashboard for generating AI resume match reports and interview preparation plans.",
        canonicalPath: "/",
        keywords: ["resume dashboard", "resume report", "interview preparation plan"],
        robots: "noindex,nofollow",
        ogType: "website",
    })

    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [roadmapDays, setRoadmapDays] = useState(25)
    const [technicalQuestionCount, setTechnicalQuestionCount] = useState(15)
    const [behavioralQuestionCount, setBehavioralQuestionCount] = useState(15)
    const [searchQuery, setSearchQuery] = useState("")
    const [adviceQuote, setAdviceQuote] = useState(FALLBACK_QUOTES[0])
    const [quoteLoading, setQuoteLoading] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined") return false
        const savedTheme = window.localStorage.getItem("resume-theme")
        if (savedTheme === "dark") return true
        if (savedTheme === "light") return false
        return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    })
    const resumeInputRef = useRef()
    const userMenuRef = useRef()
    const navigate = useNavigate()
    const filteredReports = (reports || []).filter((report) => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true
        const title = (report?.title || "").toLowerCase()
        const company = (report?.company || "").toLowerCase()
        return title.includes(q) || company.includes(q)
    })

    const setRandomFallbackQuote = () => {
        const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
        setAdviceQuote(random)
    }

    const fetchQuote = async () => {
        setQuoteLoading(true)
        try {
            const response = await fetch(`https://api.quotable.io/random?maxLength=140&t=${Date.now()}`, {
                method: "GET",
                cache: "no-store",
            })
            if (!response.ok) {
                throw new Error(`Quote API failed with status ${response.status}`)
            }
            const data = await response.json()
            setAdviceQuote({
                content: data?.content || FALLBACK_QUOTES[0].content,
                author: data?.author || "Unknown",
            })
        } catch (error) {
            setRandomFallbackQuote()
        } finally {
            setQuoteLoading(false)
        }
    }

    useEffect(() => {
        fetchQuote()
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle("theme-dark", isDarkMode)
        window.localStorage.setItem("resume-theme", isDarkMode ? "dark" : "light")
    }, [isDarkMode])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        setSubmitError("")

        if (!jobDescription.trim()) {
            setSubmitError("Job description is required.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setSubmitError("Please upload a PDF resume or provide a candidate summary.")
            return
        }

        try {
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile,
                roadmapDays,
                technicalQuestionCount,
                behavioralQuestionCount
            })

            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            }
        } catch (error) {
            setSubmitError(error.message || "Unable to analyze resume right now. Please try again.")
        }
    }

    const onLogout = async () => {
        setIsLoggingOut(true)
        try {
            await handleLogout()
            navigate('/login')
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4 font-body-custom">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                    .font-body-custom { font-family: 'Plus Jakarta Sans', sans-serif; }
                    .font-display { font-family: 'Playfair Display', serif; }
                `}</style>
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight">Analyzing your resume match...</h1>
                <p className="text-sm text-slate-500">AI is comparing your resume with the job description. This takes about 30 seconds.</p>
            </main>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

                * { box-sizing: border-box; }

                .font-display { font-family: 'Playfair Display', serif; }
                .font-mono-code { font-family: 'JetBrains Mono', monospace; }
                .font-body-custom { font-family: 'Plus Jakarta Sans', sans-serif; }

                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                    display: inline-block;
                    vertical-align: middle;
                    line-height: 1;
                }

                textarea { resize: none; font-family: 'Plus Jakarta Sans', sans-serif; }

                .field-ul {
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid #cbd5e1;
                    outline: none;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 15px;
                    color: #0f172a;
                    padding: 10px 0;
                    width: 100%;
                    transition: border-color 0.2s;
                }
                .field-ul:focus { border-bottom-color: #0d9488; }
                .field-ul::placeholder { color: #94a3b8; font-style: italic; }

                .plan-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 0;
                    border-bottom: 1px solid #e2e8f0;
                    cursor: pointer;
                    transition: padding-left 0.2s ease;
                }
                .plan-row:hover { padding-left: 8px; }
                .plan-row:last-child { border-bottom: none; }

                @keyframes shimmer {
                    0%   { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                .shimmer-btn {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 35%, #0d9488 65%, #0f172a 100%);
                    background-size: 200% auto;
                    animation: shimmer 4s linear infinite;
                }
                .shimmer-btn:hover { opacity: 0.9; }
                .shimmer-btn:active { transform: scale(0.98); }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up   { animation: fadeUp 0.5s ease both; }
                .delay-1   { animation-delay: 0.08s; }
                .delay-2   { animation-delay: 0.16s; }
                .delay-3   { animation-delay: 0.24s; }
                .delay-4   { animation-delay: 0.32s; }

                .theme-dark [class*="bg-slate-50"] { background-color: #020617 !important; }
                .theme-dark [class*="bg-white"] { background-color: #0f172a !important; }
                .theme-dark [class*="text-slate-900"] { color: #f8fafc !important; }
                .theme-dark [class*="text-slate-800"] { color: #f1f5f9 !important; }
                .theme-dark [class*="text-slate-700"] { color: #e2e8f0 !important; }
                .theme-dark [class*="text-slate-600"] { color: #cbd5e1 !important; }
                .theme-dark [class*="text-slate-500"] { color: #94a3b8 !important; }
                .theme-dark [class*="text-slate-400"] { color: #64748b !important; }
                .theme-dark [class*="text-black"] { color: #f8fafc !important; }
                .theme-dark [class*="border-slate-300"] { border-color: #334155 !important; }
                .theme-dark [class*="border-slate-200"] { border-color: #1e293b !important; }
                .theme-dark .field-ul {
                    color: #e2e8f0;
                    border-bottom-color: #334155;
                }
                .theme-dark .field-ul::placeholder { color: #64748b; }
                .theme-dark .plan-row:hover { background: #0b1220; }
            `}</style>

            {/* ── NAV ──────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between px-8 h-16 max-w-300 mx-auto">

                    <div className="flex items-center gap-10">
                        <span className="font-display text-xl font-black tracking-tight text-slate-900">
                            Resume <span className="italic text-teal-600">Analyzer</span>
                        </span>

                        <div className="hidden md:flex items-center gap-7">
                            <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-teal-600 border-b-2 border-teal-500 pb-0.5 font-medium">Resume Match</a>
                            {/* <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Drafts</a>
                            <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Archive</a> */}
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-black" style={{ fontSize: 16 }}>search</span>
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="font-mono-code text-[11px] bg-transparent border-b border-slate-300 outline-none pl-6 pr-2 py-1.5 w-44 text-black placeholder:text-slate-400 focus:border-teal-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => setIsDarkMode((prev) => !prev)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                                {isDarkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>
                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-teal-300 hover:ring-teal-400 hover:shadow-md hover:shadow-teal-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/70"
                                aria-label="Open user menu"
                            >
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADNU5lyUwVJr_dVZapvCguK0InTZum0M2xFhZcVRztLudTi5lTRUc4VB9UMybmVD1wPoWcYA_YOXyBY7VL4mUMTN4UJTEEQT_bHVTdvXMkDp1KUiT-uazwQlS-d5WC8aTdGnNx1GWbEzPIsTcRH5z3D2pdxsm_ZZRBAuiffISRMSkP7hO3mPqJOzA11jN7AZH-WCVlTvS304I8fq74i2giU19Nr8OQ0XwqESOeO0trUNixAQp7RN5nbFQ9A2x1aqMmf2WR-G33"
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-12 min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.15)] z-50">
                                    <div className="h-1 bg-linear-to-r from-teal-500 via-teal-400 to-emerald-500" />
                                    <div className="px-4 py-3.5">
                                        <p className="font-mono-code text-[9px] uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">
                                            Profile
                                        </p>
                                        <p className="font-mono-code text-[11px] uppercase tracking-widest text-slate-700 mb-3 text-center border border-slate-200 bg-slate-50 px-3 py-2">
                                        {user?.username || "User"}
                                        </p>
                                        <button
                                            onClick={onLogout}
                                            disabled={isLoggingOut}
                                            className="w-full text-center font-mono-code text-[10px] uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors py-2.5 disabled:opacity-60"
                                        >
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── MAIN ─────────────────────────────────────────────────────────── */}
            <main className="pt-16 max-w-300 mx-auto px-8">

                {/* Hero Header */}
                <header className="pt-5 pb-10 fade-up">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-black font-medium">Resume Match Analyzer</span>
                        <span className="w-8 h-px bg-teal-400 inline-block"></span>
                        <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-slate-400">Analysis Mode</span>
                    </div>

                    <div className="flex items-end justify-between gap-8">
                        <h1 className="font-display text-[54px] leading-[1.06] font-black tracking-tight text-slate-900">
                            Check Your<br />
                            <span className="italic text-teal-600">Resume Match.</span>
                        </h1>
                        <p className="font-body-custom text-sm text-slate-500 max-w-52.5 text-right leading-relaxed mb-1 shrink-0 hidden sm:block">
                            Compare your resume with role requirements and get a match score instantly.
                        </p>
                    </div>

                    <div className="mt-8 border-t-2 border-slate-900"></div>
                    <div className="mt-0.75 border-t border-teal-400/50"></div>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">

                    {/* ── LEFT ─────────────────────────────────────────────────── */}
                    <div className="lg:pr-14 pb-10">

                        {/* 01 — Job Description */}
                        <section className="mb-12 fade-up delay-1 border-2 border-dashed border-slate-300 p-2">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="font-mono-code text-[10px] text-teal-500 tracking-widest">01</span>
                                <span className="font-mono-code text-[11px] uppercase tracking-widest text-black font-semibold">Job Description</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                                <span className="bg-slate-800 text-white font-mono-code text-[9px] px-1.5 py-0.5 rounded tracking-widest uppercase">Required</span>
                            </div>

                            <textarea
                                rows={9}
                                maxLength={5000}
                                value={jobDescription}
                                onChange={(e) => {
                                    setSubmitError("")
                                    setJobDescription(e.target.value)
                                }}
                                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer requires proficiency in React...'"
                                className="field-ul text-[15px] text-gray-500 leading-relaxed"
                            />
                            <div className="flex justify-between mt-2">
                                <span className="font-mono-code text-[10px] text-slate-400">Plain text or HTML accepted</span>
                                <span className="font-mono-code text-[10px] text-slate-400">{jobDescription.length} / 5000 chars</span>
                            </div>
                        </section>
                        {/* 02 — Your Profile */}
                        <section className="mb-12 fade-up delay-2">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="font-mono-code text-[10px] text-teal-500 tracking-widest">02</span>
                                <span className="font-mono-code text-[11px] uppercase tracking-widest text-slate-800 font-semibold">Your Resume</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            {/* Upload zone */}
                            <label htmlFor="resume-upload" className="block border-2 border-dashed border-slate-300 hover:border-teal-400 bg-linear-to-br from-slate-50 to-teal-50/50 hover:to-teal-100/40 transition-all duration-300 p-10 flex flex-col items-center justify-center cursor-pointer group mb-8">
                                <div className="w-12 h-12 rounded-full bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center mb-3 transition-colors duration-200">
                                    <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                                </div>
                                <p className="font-body-custom text-[15px] font-semibold text-slate-700 mb-1">
                                    {resumeInputRef.current?.files?.[0] ? resumeInputRef.current.files[0].name : "Upload Resume"}
                                </p>
                                <p className="font-mono-code text-[10px] text-slate-400 uppercase tracking-widest">PDF only - max 5 MB</p>
                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    id="resume-upload"
                                    className="hidden"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => {
                                        setSubmitError("")
                                        // Simple trick to force re-render so the filename shows above
                                        setSelfDescription((prev) => prev + " ")
                                        setTimeout(() => setSelfDescription((prev) => prev.trimEnd()), 0)
                                    }}
                                />
                            </label>

                            <div className="flex items-center gap-4 py-2 mb-4">
                                <div className="h-px-slate-200 flex-1"></div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-code">OR</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            {/* Self description */}
                            <div>
                                <label className="font-mono-code text-[10px] uppercase tracking-widest text-slate-500 block mb-3">Quick Candidate Summary</label>
                                <input
                                    type="text"
                                    value={selfDescription}
                                    onChange={(e) => {
                                        setSubmitError("")
                                        setSelfDescription(e.target.value)
                                    }}
                                    placeholder="E.g. Frontend developer with 5+ years in SaaS and React..."
                                    className="field-ul text-[15px]"
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-slate-500 bg-slate-100/50 border border-slate-200 px-3 py-2 rounded">
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                                <span className="font-mono-code text-[10px] uppercase tracking-wider">Provide a Resume OR a Candidate Summary to proceed</span>
                            </div>
                            {submitError && (
                                <div className="mt-3 border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 rounded">
                                    <span className="font-mono-code text-[10px] uppercase tracking-wider">{submitError}</span>
                                </div>
                            )}
                        </section>

                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 fade-up delay-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <label className="mb-2 block font-mono-code text-[10px] uppercase tracking-widest text-slate-500" htmlFor="roadmapDays">
                                    Roadmap Duration
                                </label>
                                <select
                                    id="roadmapDays"
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white"
                                    value={roadmapDays}
                                    onChange={(e) => setRoadmapDays(Number(e.target.value))}
                                >
                                    <option value={7}>7 Days</option>
                                    <option value={25}>25 Days</option>
                                    <option value={45}>45 Days</option>
                                    <option value={60}>60 Days</option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <label className="mb-2 block font-mono-code text-[10px] uppercase tracking-widest text-slate-500" htmlFor="technicalQuestionCount">
                                    Technical Questions
                                </label>
                                <select
                                    id="technicalQuestionCount"
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white"
                                    value={technicalQuestionCount}
                                    onChange={(e) => setTechnicalQuestionCount(Number(e.target.value))}
                                >
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <label className="mb-2 block font-mono-code text-[10px] uppercase tracking-widest text-slate-500" htmlFor="behavioralQuestionCount">
                                    Behavioral Questions
                                </label>
                                <select
                                    id="behavioralQuestionCount"
                                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white"
                                    value={behavioralQuestionCount}
                                    onChange={(e) => setBehavioralQuestionCount(Number(e.target.value))}
                                >
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>
                        </div>

                        {/* Action bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-8 border-t border-slate-200 fade-up delay-3">
                            <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full">
                                <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                <span className="font-mono-code text-[10px] uppercase tracking-widest text-teal-700 font-semibold">Secure Processing</span>
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                disabled={loading}
                                className="shimmer-btn font-mono-code text-[11px] uppercase tracking-[0.18em] text-white px-8 py-4 w-full sm:w-auto font-semibold shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50"
                            >
                                Analyze My Resume →
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT SIDEBAR ──────────────────────────────────────────── */}
                    <aside className="lg:border-l lg:border-slate-200 lg:pl-10 pb-20 fade-up delay-4">

                        {/* Recent Reports */}
                        <div className="mb-10 pt-1">
                            <div className="flex items-baseline justify-between mb-4">
                                <span className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Recent Reports</span>
                                <span className="font-mono-code text-[10px] text-slate-400">
                                    {searchQuery.trim() ? `${filteredReports.length} of ${reports?.length || 0}` : `${reports?.length || 0}`} items
                                </span>
                            </div>

                            <div className="max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                                {filteredReports.length > 0 ? (
                                    filteredReports.map(report => (
                                        <div key={report._id} onClick={() => navigate(`/interview/${report._id}`)} className="plan-row">
                                            <div>
                                                <p className="font-body-custom text-[14px] font-bold text-slate-800 mb-1 truncate max-w-40">{report.title || 'Untitled Position'}</p>
                                                <p className="font-mono-code text-[10px] text-slate-400">Created {new Date(report.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`font-mono-code text-[10px] font-bold px-2.5 py-1 shrink-0 ml-3 border ${report.matchScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : report.matchScore >= 60 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                {report.matchScore ? `${report.matchScore}% MATCH` : 'NEW'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg">
                                        <p className="font-mono-code text-[10px] text-slate-400 uppercase tracking-widest">
                                            {searchQuery.trim() ? "No matching reports found" : "No reports generated yet"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-900 text-slate-100 relative overflow-hidden mb-8">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-teal-500 via-teal-400 to-emerald-500"></div>
                            <div className="font-display absolute -right-2 -bottom-8 text-[120px] text-teal-500/10 leading-none select-none pointer-events-none">"</div>

                            <div className="p-7 relative z-10">
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="material-symbols-outlined text-teal-400" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    <span className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-400">Pro Advice</span>
                                </div>

                                <h3 className="font-display text-[18px] font-bold leading-tight text-white mb-4">
                                    A Quote To Inspire Your Job Search Journey
                                </h3>

                                <p className="font-body-custom text-[13px] leading-[1.75] text-slate-300 mb-3">
                                    "{adviceQuote.content}"
                                </p>
                                <p className="font-mono-code text-[10px] uppercase tracking-[0.14em] text-teal-300 mb-6">
                                    - {adviceQuote.author}
                                </p>

                                <button
                                    onClick={fetchQuote}
                                    disabled={quoteLoading}
                                    className="flex items-center gap-2 font-mono-code text-[10px] uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-60"
                                >
                                    {quoteLoading ? "Loading..." : "New Quote"}
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* ── FOOTER ────────────────────────────────────────────────────────── */}
            <footer className="border-t border-slate-200 py-7 px-8 flex items-center justify-between max-w-300 mx-auto">
                <span className="font-display text-base italic text-slate-400">Resume Analyzer AI</span>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-slate-400">© 2026 Resume Analyzer AI</span>
                <span className="font-mono-code text-[10px] text-slate-300">v2.4.1</span>
            </footer>

            <style>{`
                /* Optional scrollbar hiding for the plan list if it gets long */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    )
}

export default Home
