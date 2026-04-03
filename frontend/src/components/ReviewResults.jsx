import React, { useState, useEffect } from 'react'
import ScoreRing from './ScoreRing'
import IssueCard from './IssueCard'
import { ShieldAlert, Bug, Zap, Palette, CheckCircle2, FileDown } from 'lucide-react'
import { exportReviewPdf } from '../utils/exportPdf'

const CATEGORIES = ['all', 'bug', 'security', 'performance', 'style']
const SEVERITIES  = ['all', 'critical', 'warning', 'info']

const catIcon = {
  bug:         <Bug size={13} />,
  security:    <ShieldAlert size={13} />,
  performance: <Zap size={13} />,
  style:       <Palette size={13} />,
}

const SEV_ACTIVE = {
  all:      'bg-white/10 border-white/20 text-white',
  critical: 'bg-red-500/20 border-red-500/40 text-red-400',
  warning:  'bg-amber-500/20 border-amber-500/40 text-amber-400',
  info:     'bg-blue-500/20 border-blue-500/40 text-blue-400',
}

const LANG_BADGE = {
  python:     'bg-blue-500/15 text-blue-400 border-blue-500/25',
  javascript: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  typescript: 'bg-blue-400/15 text-blue-300 border-blue-400/25',
  java:       'bg-orange-500/15 text-orange-400 border-orange-500/25',
  cpp:        'bg-purple-500/15 text-purple-400 border-purple-500/25',
  c:          'bg-gray-500/15 text-gray-400 border-gray-500/25',
  go:         'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  rust:       'bg-orange-600/15 text-orange-500 border-orange-600/25',
}

export default function ReviewResults({ result }) {

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('theme-dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('theme-dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const [catFilter, setCatFilter] = useState('all')
  const [sevFilter, setSevFilter] = useState('all')
  const [expanded,  setExpanded]  = useState(null)

  const {
    issues = [],
    score,
    summary,
    critical_count,
    warning_count,
    info_count,
    language
  } = result

  const filtered = issues.filter(iss => {
    const catOk = catFilter === 'all' || iss.category === catFilter
    const sevOk = sevFilter === 'all' || iss.severity === sevFilter
    return catOk && sevOk
  })

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  const chipBase = `
    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
    border cursor-pointer transition-all duration-150 whitespace-nowrap select-none
  `

  const chipInactive = isDark
    ? 'bg-transparent border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15 hover:bg-white/5'
    : 'bg-transparent border-black/10 text-gray-500 hover:text-gray-800 hover:border-black/20 hover:bg-black/5'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      gap: '24px',
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>

      {/* SUMMARY */}
      <div 
        className="rounded-2xl border bg-white/5 border-white/10 shadow-lg relative overflow-hidden flex-shrink-0"
        style={{ padding: '1.5rem' }}
      >
        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-bold border tracking-wider uppercase shadow-sm ${
              LANG_BADGE[language] || 'bg-gray-500/15 text-gray-400 border-gray-500/25'
            }`}>
              {language}
            </span>

            <span className="text-sm font-semibold text-gray-300">
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportReviewPdf(result)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200 cursor-pointer"
              title="Export as PDF"
            >
              <FileDown size={14} />
              Export PDF
            </button>
            <ScoreRing score={score} size={56} />
          </div>
        </div>

        {/* COUNTERS */}
        <div className="flex gap-4 mb-6 relative z-10">

          <div 
            className="flex-1 flex flex-col items-center rounded-xl border bg-red-500/10 border-red-500/30 shadow-inner"
            style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
          >
            <span className="text-2xl font-black text-red-400 drop-shadow-sm">{critical_count}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-500/90 mt-1">Critical</span>
          </div>

          <div 
            className="flex-1 flex flex-col items-center rounded-xl border bg-amber-500/10 border-amber-500/30 shadow-inner"
            style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
          >
            <span className="text-2xl font-black text-amber-400 drop-shadow-sm">{warning_count}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/90 mt-1">Warning</span>
          </div>

          <div 
            className="flex-1 flex flex-col items-center rounded-xl border bg-blue-500/10 border-blue-500/30 shadow-inner"
            style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}
          >
            <span className="text-2xl font-black text-blue-400 drop-shadow-sm">{info_count}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-500/90 mt-1">Info</span>
          </div>

        </div>

        {/* SUMMARY TEXT */}
        {summary && (
          <div 
            className="rounded-xl bg-black/20 border border-white/5 relative z-10"
            style={{ padding: '1rem' }}
          >
            <p className="text-sm font-medium text-gray-300/90 leading-relaxed">
              {summary}
            </p>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 mt-2 flex-shrink-0">

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => {
            const isActive = catFilter === c
            return (
              <button
                key={c}
                className={`${chipBase} ${
                  isActive
                    ? (isDark ? 'bg-white/15 border-white/30 text-white shadow-sm' : 'bg-black/10 border-black/20 text-black shadow-sm')
                    : chipInactive
                }`}
                onClick={() => setCatFilter(c)}
              >
                {c !== 'all' && catIcon[c]}
                {c === 'all' ? 'All' : c}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {SEVERITIES.map(s => {
            const isActive = sevFilter === s
            return (
              <button
                key={s}
                className={`${chipBase} ${
                  isActive
                    ? SEV_ACTIVE[s] + ' shadow-sm'
                    : chipInactive
                }`}
                onClick={() => setSevFilter(s)}
              >
                {s === 'all' ? 'All severity' : s}
              </button>
            )
          })}
        </div>

      </div>

      {/* ISSUE LIST */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center gap-3 py-12 rounded-2xl border border-white/10 bg-white/5 text-gray-400 flex-shrink-0">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <span className="text-sm font-medium">No issues match the filters</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px' }}>
          {filtered.map((issue, idx) => (
            <IssueCard
              key={issue.id ?? idx}
              issue={issue}
              index={idx}
              expanded={expanded === (issue.id ?? idx)}
              onToggle={() => toggle(issue.id ?? idx)}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  )
}