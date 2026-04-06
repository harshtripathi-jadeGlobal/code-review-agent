import React, { useEffect, useState } from 'react'
import { Code2, ShieldCheck, Zap, Palette, Users, Brain, Cpu, Database } from 'lucide-react'

export default function AboutPage() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('theme-dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('theme-dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="h-full w-full bg-gray-950 overflow-y-auto overflow-x-hidden text-white">
      <div className="mx-auto max-w-[1400px] w-full px-6 sm:px-12 lg:px-16 flex flex-col items-center">

        {/* Main Content Constraint */}
        <div className="max-w-5xl w-full relative flex flex-col items-center">

          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 p-64 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-64 left-0 p-64 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col w-full">

            {/* Hero (fills first screen under navbar) */}
            <section
              className="flex flex-col items-center justify-center text-center gap-6 w-full"
              style={{
                minHeight: 'calc(100vh - 68px)',
                paddingTop: '3rem',
                paddingBottom: '3rem',
              }}
            >
              <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <Brain size={48} className="text-blue-400" />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-purple-300 tracking-tight leading-tight text-center">
                  CODESAGE
                </h1>
                <p className="text-sm font-semibold tracking-[0.2em] text-blue-400 mt-2 uppercase text-center">
                  AI Code Review Agent
                </p>
              </div>
              <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed text-center mx-auto">
                &quot;Instant, intelligent code reviews &mdash; catch bugs before they ship.&quot;
              </p>
            </section>

            {/* Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />

            {/* What It Does & Problem it Solves */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full" style={{ marginTop: '6rem', paddingBottom: '1rem' }}>
              <div 
                className={`rounded-2xl border shadow-xl w-full flex flex-col justify-start ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-black/10'
                }`}
                style={{ padding: '2.5rem' }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Cpu size={20} className="text-purple-400" />
                  What It Does
                </h2>
                <p className={isDark ? 'text-gray-400 leading-relaxed text-[15px]' : 'text-gray-700 leading-relaxed text-[15px]'}>
                  An AI-powered tool that automatically reviews code for bugs, security vulnerabilities, performance issues, and style violations &mdash; providing actionable fix suggestions in seconds.
                </p>
              </div>

              <div 
                className={`rounded-2xl border shadow-xl w-full flex flex-col justify-start ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-black/10'
                }`}
                style={{ padding: '2.5rem' }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-red-400" />
                  The Problem It Solves
                </h2>
                <p className={isDark ? 'text-gray-400 leading-relaxed text-[15px]' : 'text-gray-700 leading-relaxed text-[15px]'}>
                  Freshers often introduce anti-patterns and vulnerabilities. Senior developers become review bottlenecks. This agent automates the first pass &mdash; ensuring faster feedback and much less friction in the pipeline.
                </p>
              </div>
            </section>

            {/* Key Features */}
            <section className="flex flex-col gap-8 w-full" style={{ marginTop: '7rem', paddingBottom: '1rem' }}>
              <h2 className="text-3xl font-bold text-center text-white">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <FeatureCard
                  icon={<Code2 className="text-blue-400" />}
                  text="Multi-language support (Python, JavaScript, and more)"
                />
                <FeatureCard
                  icon={<ShieldCheck className="text-amber-400" />}
                  text="Multi-category analysis: Bugs, Security, Performance, Style"
                />
                <FeatureCard
                  icon={<Zap className="text-red-400" />}
                  text="Severity ratings: Critical / Warning / Info"
                />
                <FeatureCard
                  icon={<Palette className="text-emerald-400" />}
                  text="AI-generated fix suggestions with before/after diffs"
                />
              </div>
            </section>

            {/* Tech Stack */}
            <section className="flex flex-col items-center text-center gap-8 w-full" style={{ marginTop: '7rem', paddingBottom: '1rem' }}>
              <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <Database size={28} className="text-emerald-400" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
                {['React 18', 'Vite', 'TailwindCSS', 'highlight.js', 'FastAPI', 'MySQL 8', 'OpenAI / Groq API'].map(tech => (
                  <span
                    key={tech}
                    className={`rounded-2xl border text-sm font-semibold shadow-sm ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 text-gray-200'
                        : 'bg-white border-black/10 text-gray-800'
                    }`}
                    style={{ padding: '14px 28px' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" style={{ marginTop: '7rem' }} />

            {/* Team */}
            <section className="flex flex-col items-center justify-center text-center gap-8 w-full" style={{ marginTop: '7rem', marginBottom: '6rem' }}>
              <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                <Users size={28} className="text-blue-400" />
                Team Members
              </h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                {['Aamil Khan', 'Harsh Tripathi', 'Kumudini Gholap', 'Sanket Kingaonkar', 'Aadil Siddiqui'].map(member => (
                  <div
                    key={member}
                    className={`rounded-full border text-sm font-semibold shadow-sm ${
                      isDark
                        ? 'bg-gray-900 border-gray-800 text-white'
                        : 'bg-white border-black/10 text-gray-900'
                    }`}
                    style={{ padding: '14px 30px', lineHeight: 1.25 }}
                  >
                    {member}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, text }) {
  return (
    <div className="flex flex-row items-center gap-4 p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors duration-200 shadow-sm w-full">
      <div className="flex-shrink-0 p-3 rounded-xl bg-gray-800 border border-gray-700 shadow-inner">
        {icon}
      </div>
      <span className="text-base font-medium text-gray-300 leading-snug">
        {text}
      </span>
    </div>
  )
}
