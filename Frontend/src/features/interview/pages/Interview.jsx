import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useSeo } from '../../../shared/seo/useSeo.js'

const FALLBACK_QUOTES = [
    { content: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
    { content: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
    { content: "Well done is better than well said.", author: "Benjamin Franklin" },
]

/* ─── shared design tokens (mirror Home.jsx) ─────────────────────────────── */
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

    * { box-sizing: border-box; }

    .font-display     { font-family: 'Playfair Display', serif; }
    .font-mono-code   { font-family: 'JetBrains Mono', monospace; }
    .font-body-custom { font-family: 'Plus Jakarta Sans', sans-serif; }

    .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        display: inline-block;
        vertical-align: middle;
        line-height: 1;
    }

    /* accordion row hover */
    .q-row { transition: background 0.15s; }
    .q-row:hover { background: #f8fafc; }

    /* nav pill active */
    .nav-pill-active  { background: #0f172a; color: #fff; }
    .nav-pill-inactive { color: #64748b; }
    .nav-pill-inactive:hover { background: #f1f5f9; color: #0f172a; }

    /* shimmer CTA */
    @keyframes shimmer {
        0%   { background-position: 0% center; }
        100% { background-position: 200% center; }
    }
    .shimmer-btn {
        background: linear-gradient(135deg,#0f172a 0%,#1e3a5f 35%,#0d9488 65%,#0f172a 100%);
        background-size: 200% auto;
        animation: shimmer 4s linear infinite;
    }
    .shimmer-btn:hover  { opacity: 0.9; }
    .shimmer-btn:active { transform: scale(0.98); }

    /* fade-up entrance */
    @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up  { animation: fadeUp 0.5s ease both; }
    .delay-1  { animation-delay: 0.08s; }
    .delay-2  { animation-delay: 0.16s; }
    .delay-3  { animation-delay: 0.24s; }
    .delay-4  { animation-delay: 0.32s; }

    /* spinner */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; }

    /* roadmap line */
    .roadmap-wrap { position: relative; }
    .roadmap-wrap::before {
        content: '';
        position: absolute;
        left: 7px; top: 10px; bottom: 10px;
        width: 1px;
        background: linear-gradient(to bottom, #0d9488, transparent);
    }
`

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { id: 'technical', label: 'Technical', icon: 'code' },
    { id: 'behavioral', label: 'Behavioral', icon: 'forum' },
    { id: 'roadmap', label: 'Roadmap', icon: 'route' },
]

const scoreTheme = (score) => {
    if (score >= 80) return {
        bar: 'from-emerald-500 to-teal-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'Strong match for this role',
    }
    if (score >= 60) return {
        bar: 'from-amber-400 to-orange-400',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'Promising fit — a few gaps to close',
    }
    return {
        bar: 'from-rose-500 to-rose-400',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        text: 'More prep needed before this role',
    }
}

const severityBadge = (sev) => ({
    high: 'bg-rose-50    text-rose-700    border-rose-200',
    medium: 'bg-amber-50   text-amber-700   border-amber-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}[sev] ?? 'bg-slate-100 text-slate-600 border-slate-200')

/* ─── sub-components ─────────────────────────────────────────────────────── */
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b border-slate-200 last:border-none">
            {/* question row */}
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className="q-row w-full flex items-start gap-4 py-5 text-left"
            >
                {/* Q number */}
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-teal-600 border border-teal-200 bg-teal-50 px-2 py-1 shrink-0 mt-0.5">
                    Q{index + 1}
                </span>
                {/* question text */}
                <p className="font-body-custom flex-1 text-[15px] leading-relaxed text-slate-800 font-medium">{item.question}</p>
                {/* chevron */}
                <span
                    className={`material-symbols-outlined text-slate-400 transition-transform duration-200 shrink-0 mt-0.5 ${open ? 'rotate-180 text-teal-600' : ''}`}
                    style={{ fontSize: 18 }}
                >
                    expand_more
                </span>
            </button>

            {/* expanded answer */}
            {open && (
                <div className="pb-6 flex flex-col gap-4 pl-13">
                    {/* intention */}
                    <div className="border-l-2 border-violet-400 pl-4">
                        <span className="font-mono-code text-[10px] uppercase tracking-widest text-violet-600 block mb-1">Intention</span>
                        <p className="font-body-custom text-[14px] leading-relaxed text-slate-600">{item.intention}</p>
                    </div>
                    {/* model answer */}
                    <div className="border-l-2 border-emerald-400 pl-4">
                        <span className="font-mono-code text-[10px] uppercase tracking-widest text-emerald-600 block mb-1">Model Answer</span>
                        <p className="font-body-custom text-[14px] leading-relaxed text-slate-600">{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className="relative pl-8">
        {/* dot */}
        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-teal-500 bg-slate-50 z-10" />
        <div className="pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-teal-600 border border-teal-200 bg-teal-50 px-2.5 py-1">
                    Day {day.day}
                </span>
                <h3 className="font-display text-[20px] font-bold text-slate-900 italic">{day.focus}</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
                {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span className="font-body-custom text-[14px] leading-relaxed text-slate-600">{task}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
)

const LoadingView = () => (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4 font-body-custom">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            .font-body-custom { font-family: 'Plus Jakarta Sans', sans-serif; }
            .font-display { font-family: 'Playfair Display', serif; }
        `}</style>
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight">Loading your plan…</h1>
        <p className="text-sm text-slate-500">Assembling questions, match score and roadmap.</p>
    </main>
)

/* ─── main page ──────────────────────────────────────────────────────────── */
const Interview = () => {
    const { interviewId } = useParams()

    useSeo({
        title: "Interview Report",
        description: "Private interview report with match score, skill gaps, and roadmap.",
        canonicalPath: interviewId ? `/interview/${interviewId}` : "/interview",
        keywords: ["interview report", "resume match insights", "skill gap analysis"],
        robots: "noindex,nofollow,noarchive,nosnippet",
        ogType: "article",
    })

    const [activeNav, setActiveNav] = useState('technical')
    const [adviceQuote, setAdviceQuote] = useState(FALLBACK_QUOTES[0])
    const [quoteLoading, setQuoteLoading] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === "undefined") return false
        const savedTheme = window.localStorage.getItem("resume-theme")
        if (savedTheme === "dark") return true
        if (savedTheme === "light") return false
        return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
    })
    const userMenuRef = useRef()
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()
    const { report, getReportById, loading, getResumePdf } = useInterview()

    useEffect(() => {
        if (interviewId) getReportById(interviewId)
    }, [interviewId])

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

    const onLogout = async () => {
        setIsLoggingOut(true)
        try {
            await handleLogout()
            navigate('/login')
        } finally {
            setIsLoggingOut(false)
        }
    }

    if (loading || !report) return <LoadingView />

    const score = scoreTheme(report.matchScore)

    const sections = {
        technical: {
            num: '01',
            title: 'Technical Questions',
            count: `${report.technicalQuestions.length} questions`,
            content: report.technicalQuestions.map((q, i) => <QuestionCard key={i} item={q} index={i} />),
        },
        behavioral: {
            num: '02',
            title: 'Behavioral Questions',
            count: `${report.behavioralQuestions.length} questions`,
            content: report.behavioralQuestions.map((q, i) => <QuestionCard key={i} item={q} index={i} />),
        },
        roadmap: {
            num: '03',
            title: 'Preparation Roadmap',
            count: `${report.preparationPlan.length}-day plan`,
            content: (
                <div className="roadmap-wrap">
                    {report.preparationPlan.map(day => <RoadMapDay key={day.day} day={day} />)}
                </div>
            ),
        },
    }

    const active = sections[activeNav]

    return (
        <div className="min-h-screen bg-slate-50 antialiased font-body-custom">
            <style>{STYLES}</style>
            <style>{`
                .theme-dark [class*="bg-slate-50"] { background-color: #020617 !important; }
                .theme-dark [class*="bg-white"] { background-color: #0f172a !important; }
                .theme-dark [class*="text-slate-900"] { color: #f8fafc !important; }
                .theme-dark [class*="text-slate-800"] { color: #f1f5f9 !important; }
                .theme-dark [class*="text-slate-700"] { color: #e2e8f0 !important; }
                .theme-dark [class*="text-slate-600"] { color: #cbd5e1 !important; }
                .theme-dark [class*="text-slate-500"] { color: #94a3b8 !important; }
                .theme-dark [class*="text-slate-400"] { color: #64748b !important; }
                .theme-dark [class*="border-slate-300"] { border-color: #334155 !important; }
                .theme-dark [class*="border-slate-200"] { border-color: #1e293b !important; }
                .theme-dark .q-row:hover { background: #0b1220; }
                .theme-dark .nav-pill-inactive:hover { background: #0b1220; color: #f8fafc; }
            `}</style>

            {/* ── NAV ──────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50/90 backdrop-blur-md border-b border-slate-200">
                <div className="flex items-center justify-between px-8 h-16 max-w-300 mx-auto">
                    <div className="flex items-center gap-10">
                        <span className="font-display text-xl font-black tracking-tight text-slate-900">
                            Resume<span className="italic text-teal-600">Analyzer</span>
                        </span>
                        <div className="hidden md:flex items-center gap-7">
                            <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-teal-600 border-b-2 border-teal-500 pb-0.5">Resume Architect</a>
                            {/* <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Drafts</a>
                            <a href="#" className="font-mono-code text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">Archive</a> */}
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
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

            {/* ── CONTENT ──────────────────────────────────────────────────── */}
            <div className="pt-16 max-w-300 mx-auto px-8">

                {/* Page header */}
                <header className="pt-14 pb-10 fade-up">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-teal-600">Interview Report</span>
                        <span className="w-8 h-px bg-teal-400 inline-block" />
                        <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] text-slate-400">Dashboard</span>
                    </div>

                    <div className="flex items-end justify-between gap-8">
                        <h1 className="font-display text-[48px] leading-[1.06] font-black tracking-tight text-slate-900">
                            {report.title || 'Interview Prep'}<br />
                            <span className="italic text-teal-600">Dashboard.</span>
                        </h1>

                        {/* Download button — matches shimmer CTA pattern */}
                        <button
                            onClick={() => getResumePdf(interviewId)}
                            className="shimmer-btn font-mono-code text-[11px] uppercase tracking-[0.18em] text-white px-6 py-3.5 shrink-0 hidden sm:flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
                            Download Resume PDF
                        </button>
                    </div>

                    <p className="font-body-custom text-[15px] text-slate-500 mt-4 max-w-xl leading-relaxed">
                        Switch between question sets, review skill gaps, and export your resume draft when ready.
                    </p>

                    {/* Double rule — same as Home */}
                    <div className="mt-8 border-t-2 border-slate-900" />
                    <div className="mt-0.75 border-t border-teal-400/50" />
                </header>

                {/* 3-column grid: left nav | main panel | right sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-0 items-start pb-20">

                    {/* ── LEFT NAV ─────────────────────────────────────────── */}
                    <nav className="lg:pr-8 lg:border-r lg:border-slate-200 fade-up delay-1 mb-8 lg:mb-0">
                        <p className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-4 pt-1">Sections</p>
                        <div className="flex lg:flex-col gap-2">
                            {NAV_ITEMS.map(item => {
                                const isActive = activeNav === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveNav(item.id)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 text-left w-full transition-all duration-150 ${isActive ? 'nav-pill-active' : 'nav-pill-inactive'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                                        <span className="font-mono-code text-[11px] uppercase tracking-widest font-medium">{item.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </nav>

                    {/* ── MAIN PANEL ───────────────────────────────────────── */}
                    <main className="lg:px-10 fade-up delay-2 min-h-[60vh]">
                        {/* Section header */}
                        <div className="flex items-center gap-4 mb-6 pt-1">
                            <span className="font-mono-code text-[10px] text-teal-500 tracking-widest">{active.num}</span>
                            <span className="font-mono-code text-[11px] uppercase tracking-widest text-slate-800 font-semibold">{active.title}</span>
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="font-mono-code text-[10px] text-slate-400">{active.count}</span>
                        </div>

                        {/* Section content */}
                        <div>{active.content}</div>
                    </main>

                    {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
                    <aside className="lg:border-l lg:border-slate-200 lg:pl-10 fade-up delay-3">

                        {/* Match Score */}
                        <div className="mb-8 pt-1">
                            <div className="flex items-baseline justify-between mb-5">
                                <span className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Match Score</span>
                                <span className="font-mono-code text-[13px] font-bold text-slate-900">{report.matchScore}%</span>
                            </div>

                            {/* Score ring — editorial flat style */}
                            <div className="flex items-center gap-5 mb-4">
                                <div className="relative w-20 h-20 shrink-0">
                                    {/* track */}
                                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                        <circle
                                            cx="40" cy="40" r="34"
                                            fill="none"
                                            stroke={report.matchScore >= 80 ? '#10b981' : report.matchScore >= 60 ? '#f59e0b' : '#f43f5e'}
                                            strokeWidth="6"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(report.matchScore / 100) * 213.6} 213.6`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="font-display text-[18px] font-black text-slate-900">{report.matchScore}</span>
                                    </div>
                                </div>
                                <p className={`font-body-custom text-[13px] leading-relaxed border px-3 py-2 flex-1 ${score.badge}`}>
                                    {score.text}
                                </p>
                            </div>

                            {/* Score bar */}
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-linear-to-r ${score.bar} rounded-full transition-all duration-700`}
                                    style={{ width: `${report.matchScore}%` }}
                                />
                            </div>
                        </div>

                        {/* divider */}
                        <div className="border-t border-slate-200 mb-8" />

                        {/* Skill Gaps */}
                        <div className="mb-8">
                            <div className="flex items-baseline justify-between mb-4">
                                <span className="font-mono-code text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Skill Gaps</span>
                                <span className="font-mono-code text-[10px] text-slate-400">{report.skillGaps.length} identified</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {report.skillGaps.map((gap, i) => (
                                    <span
                                        key={i}
                                        className={`font-mono-code text-[10px] uppercase tracking-widest border px-2.5 py-1 font-semibold ${severityBadge(gap.severity)}`}
                                    >
                                        {gap.skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* divider */}
                        <div className="border-t border-slate-200 mb-8" />

                        {/* Pro tip dark card — mirrors Home's Pro Advice block */}
                        <div className="bg-slate-900 text-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-teal-500 via-teal-400 to-emerald-500" />
                            <div className="font-display absolute -right-2 -bottom-8 text-[110px] text-teal-500/10 leading-none select-none pointer-events-none">"</div>
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

                        {/* Mobile download button */}
                        <button
                            onClick={() => getResumePdf(interviewId)}
                            className="shimmer-btn sm:hidden mt-6 w-full font-mono-code text-[11px] uppercase tracking-[0.18em] text-white px-6 py-4 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
                            Download Resume PDF
                        </button>
                    </aside>
                </div>
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer className="border-t border-slate-200 py-7 px-8 flex items-center justify-between max-w-300 mx-auto">
                <span className="font-display text-base italic text-slate-400">Resume Analyzer AI</span>
                <span className="font-mono-code text-[10px] uppercase tracking-widest text-slate-400">© 2026 Resume Analyzer AI</span>
                <span className="font-mono-code text-[10px] text-slate-300">v2.4.1</span>
            </footer>
        </div>
    )
}

export default Interview
