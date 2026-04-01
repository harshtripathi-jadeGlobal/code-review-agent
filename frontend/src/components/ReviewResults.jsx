import React, { useState } from 'react'
import ScoreRing from './ScoreRing'
import IssueCard from './IssueCard'
import { ShieldAlert, Bug, Zap, Palette, CheckCircle2 } from 'lucide-react'

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

  const isDark = true // 🔥 FORCE DARK MODE

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

  const chipInactive =
    'bg-transparent border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15 hover:bg-white/5'

  return (
    <div className="flex flex-col p-8 gap-5">

      {/* SUMMARY */}
      <div className="rounded-xl p-4 border bg-white/3 border-white/8">

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border tracking-wide ${
              LANG_BADGE[language] || 'bg-gray-500/15 text-gray-400 border-gray-500/25'
            }`}>
              {language}
            </span>

            <span className="text-[13px] font-medium text-gray-400">
              {issues.length} issues found
            </span>
          </div>

          <ScoreRing score={score} size={52} />
        </div>

        {/* COUNTERS */}
        <div className="flex gap-3 mb-4">

          <div className="flex-1 flex flex-col items-center py-5 rounded-lg border bg-red-500/8 border-red-500/20">
            <span className="text-xl font-bold text-red-400">{critical_count}</span>
            <span className="text-[11px] text-red-500/80">Critical</span>
          </div>

          <div className="flex-1 flex flex-col items-center py-3 rounded-lg border bg-amber-500/8 border-amber-500/20">
            <span className="text-xl font-bold text-amber-400">{warning_count}</span>
            <span className="text-[11px] text-amber-500/80">Warning</span>
          </div>

          <div className="flex-1 flex flex-col items-center py-3 rounded-lg border bg-blue-500/8 border-blue-500/20">
            <span className="text-xl font-bold text-blue-400">{info_count}</span>
            <span className="text-[11px] text-blue-500/80">Info</span>
          </div>

        </div>

        {/* SUMMARY TEXT */}
        {summary && (
          <p className="text-[13px] text-gray-400 leading-relaxed">
            {summary}
          </p>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-2.5">

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(c => {
            const isActive = catFilter === c
            return (
              <button
                key={c}
                className={`${chipBase} ${
                  isActive
                    ? 'bg-white/10 border-white/20 text-white'
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

        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map(s => {
            const isActive = sevFilter === s
            return (
              <button
                key={s}
                className={`${chipBase} ${
                  isActive
                    ? SEV_ACTIVE[s]
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
        <div className="flex items-center justify-center gap-2 py-10 rounded-xl border border-white/8 text-gray-500">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-[13px]">No issues match the filters</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((issue, idx) => (
            <IssueCard
              key={issue.id ?? idx}
              issue={issue}
              index={idx}
              expanded={expanded === (issue.id ?? idx)}
              onToggle={() => toggle(issue.id ?? idx)}
              isDark={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}