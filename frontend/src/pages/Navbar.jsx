import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Code2, History, BarChart3, Info, Menu, X, Zap, ChevronRight, User } from "lucide-react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        try {
            const stored = localStorage.getItem("cw_theme");
            if (stored === "light" || stored === "dark") return stored;
            const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
            return prefersDark ? "dark" : "light";
        } catch {
            return "dark";
        }
    });

    const isDark = theme === "dark";

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("theme-dark", isDark);
        root.classList.toggle("theme-light", !isDark);
        try {
            localStorage.setItem("cw_theme", theme);
        } catch { }
    }, [theme, isDark]);

    // ── Button order: Home → History → Stats → About ──────────────────────────
    const navItems = [
        { name: "Home", path: "/", icon: <Code2 size={15} />, color: "blue" },
        { name: "History", path: "/history", icon: <History size={15} />, color: "violet" },
        { name: "Stats", path: "/stats", icon: <BarChart3 size={15} />, color: "emerald" },
        { name: "About", path: "/about", icon: <Info size={15} />, color: "orange" },
    ];

    const colorMap = {
        blue: { bg: 'rgba(37,99,235,0.15)', border: 'rgba(59,130,246,0.4)', text: isDark ? '#93c5fd' : '#1d4ed8', dot: '#3b82f6' },
        violet: { bg: 'rgba(124,58,237,0.15)', border: 'rgba(139,92,246,0.4)', text: isDark ? '#c4b5fd' : '#6d28d9', dot: '#8b5cf6' },
        emerald: { bg: 'rgba(5,150,105,0.15)', border: 'rgba(16,185,129,0.4)', text: isDark ? '#6ee7b7' : '#065f46', dot: '#10b981' },
        orange: { bg: 'rgba(194,65,12,0.15)', border: 'rgba(249,115,22,0.4)', text: isDark ? '#fdba74' : '#9a3412', dot: '#f97316' },
    };

    // ── Theme tokens ────────────────────────────────────────────────────────────
    const headerBg = isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)';
    const headerBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';

    const navPillBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const navPillBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)';

    // Always white in dark, always black in light — no exceptions
    const inactiveText = isDark ? '#ffffff' : '#000000';
    const hoverText = isDark ? '#ffffff' : '#000000';
    const hoverBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
    const hoverBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

    const logoTitle = isDark ? '#ffffff' : '#000000';
    const logoSubtext = isDark ? 'rgba(148,163,184,0.65)' : 'rgba(71,85,105,0.75)';

    const toggleBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const toggleBorder = isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.12)';
    const toggleColor = isDark ? '#ffffff' : '#000000';

    const drawerBg = isDark ? '#0f172a' : '#ffffff';
    const drawerBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    const drawerLabel = isDark ? '#64748b' : '#94a3b8';
    const drawerInactive = isDark ? '#ffffff' : '#000000';

    const menuBtnBg = isDark
        ? (open ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)')
        : (open ? 'rgba(59,130,246,0.10)' : 'rgba(0,0,0,0.05)');
    const menuBtnBorder = isDark
        ? (open ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.09)')
        : (open ? 'rgba(59,130,246,0.4)' : 'rgba(0,0,0,0.10)');
    const menuBtnColor = open ? '#3b82f6' : (isDark ? '#ffffff' : '#000000');
    // ────────────────────────────────────────────────────────────────────────────

    return (
        <>
            <header
                className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
                style={{ background: headerBg, borderColor: headerBorder }}
            >
                {/* shimmer top line */}
                <div
                    className="absolute top-0 inset-x-0 h-px pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.55) 30%, rgba(139,92,246,0.55) 70%, transparent 100%)',
                    }}
                />

                {/* Navbar Content Constraint */}
                <div className="flex items-center mx-auto max-w-[1400px] w-full px-6 sm:px-12 lg:px-16 h-[68px]">

                    {/* ── Logo ── */}
                    <div className="flex-shrink-0">
                        <NavLink to="/" className="flex items-center gap-2.5 group w-fit">
                            <div className="relative flex items-center justify-center">
                                <div
                                    className="absolute -inset-1.5 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300"
                                    style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.6), transparent)' }}
                                />
                                <img src="/logo.png" alt="Logo" className="relative w-9 h-9 object-contain drop-shadow-md" />
                            </div>
                            <div className="leading-none ml-5">
                                <div
                                    className="text-xl font-semibold tracking-tight transition-colors duration-300"
                                    style={{ color: logoTitle }}
                                >
                                   CODESAGE
                                </div>
                                <div
                                    className="text-[8.5px] font-semibold tracking-[0.15em] uppercase mt-0.5 transition-colors duration-300"
                                    style={{ color: logoSubtext }}
                                >
                                    AI Review Agent
                                </div>
                            </div>
                        </NavLink>
                    </div>

                    {/* ── Desktop Nav ── */}
                    <nav className="hidden md:flex flex-1 items-center justify-center">
                        <div
                            className="flex items-center transition-colors duration-300"
                            style={{
                                background: navPillBg,
                                border: `1px solid ${navPillBorder}`,
                                borderRadius: '12px',
                                padding: '5px',
                                gap: '2px',
                            }}
                        >
                            {navItems.map((item) => {
                                const c = colorMap[item.color];
                                return (
                                    <NavLink key={item.name} to={item.path}>
                                        {({ isActive }) => (
                                            <span
                                                className="flex items-center gap-2 rounded-[9px] text-[13px] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap select-none"
                                                style={{
                                                    padding: '8px 20px',
                                                    ...(isActive ? {
                                                        background: c.bg,
                                                        border: `1px solid ${c.border}`,
                                                        color: c.text,
                                                        boxShadow: `0 0 14px ${c.bg}`,
                                                    } : {
                                                        background: 'transparent',
                                                        border: '1px solid transparent',
                                                        color: inactiveText,
                                                    })
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = hoverBg;
                                                        e.currentTarget.style.color = hoverText;
                                                        e.currentTarget.style.borderColor = hoverBorder;
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = inactiveText;
                                                        e.currentTarget.style.borderColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                <span style={{
                                                    color: isActive ? c.dot : 'inherit',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    {item.icon}
                                                </span>
                                                {item.name}
                                                {isActive && (
                                                    <span
                                                        className="w-1 h-1 rounded-full"
                                                        style={{
                                                            background: c.dot,
                                                            boxShadow: `0 0 5px ${c.dot}`,
                                                            flexShrink: 0,
                                                            marginLeft: '2px',
                                                        }}
                                                    />
                                                )}
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>

                    {/* ── Right side ── */}
                    <div className="flex-shrink-0 flex items-center gap-2 ml-6">
                        {/* ── User Session ── */}
                        {currentUser ? (
                            <div className="flex items-center gap-3 mr-2">
                                <span className="text-sm font-medium hidden md:flex items-center gap-1" style={{ color: inactiveText }}>
                                    <User size={14} />
                                    {currentUser.name || currentUser.email.split('@')[0]}
                                </span>
                                <button 
                                    onClick={logout}
                                    className="text-xs bg-red-600/20 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-600/30 transition cursor-pointer"
                                    title="Logout"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mr-2">
                                <NavLink to="/login" className="text-sm font-medium hover:opacity-80 transition" style={{ color: inactiveText }}>
                                    Log in
                                </NavLink>
                            </div>
                        )}

                        {/* Theme toggle */}
                        <button
                            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            style={{
                                background: toggleBg,
                                border: `1px solid ${toggleBorder}`,
                                color: toggleColor,
                            }}
                        >
                            {isDark ? <FiMoon size={15} /> : <FiSun size={15} />}
                        </button>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-95"
                            style={{
                                background: menuBtnBg,
                                border: `1px solid ${menuBtnBorder}`,
                                color: menuBtnColor,
                            }}
                        >
                            {open ? <X size={15} /> : <Menu size={15} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            {open && (
                <div className="fixed inset-0 z-40 md:hidden" style={{ top: '68px' }}>
                    <div
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setOpen(false)}
                    />

                    <div
                        className="absolute top-0 right-0 h-full w-64 flex flex-col transition-colors duration-300"
                        style={{
                            background: drawerBg,
                            borderLeft: `1px solid ${drawerBorder}`,
                            boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${drawerBorder}` }}>
                            <p
                                className="text-[10px] font-semibold tracking-[0.2em] uppercase"
                                style={{ color: drawerLabel }}
                            >
                                Navigation
                            </p>
                        </div>

                        <nav className="flex flex-col gap-1 p-3 flex-1">
                            {navItems.map((item) => {
                                const c = colorMap[item.color];
                                return (
                                    <NavLink key={item.name} to={item.path} onClick={() => setOpen(false)}>
                                        {({ isActive }) => (
                                            <span
                                                className="flex items-center gap-3 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200 select-none"
                                                style={{
                                                    padding: '10px 14px',
                                                    ...(isActive ? {
                                                        background: c.bg,
                                                        border: `1px solid ${c.border}`,
                                                        color: c.text,
                                                    } : {
                                                        background: 'transparent',
                                                        border: '1px solid transparent',
                                                        color: drawerInactive,
                                                    })
                                                }}
                                            >
                                                <span style={{
                                                    color: isActive ? c.dot : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    {item.icon}
                                                </span>
                                                <span className="flex-1">{item.name}</span>
                                                <ChevronRight
                                                    size={13}
                                                    style={{
                                                        color: isActive ? c.dot : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            </span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>

                        <div className="px-5 py-4" style={{ borderTop: `1px solid ${drawerBorder}` }}>
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                                    style={{ boxShadow: '0 0 5px #10b981' }}
                                />
                                <span className="text-[10px] font-medium" style={{ color: '#34d399' }}>
                                    All systems operational
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}