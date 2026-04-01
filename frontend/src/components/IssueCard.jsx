import React, { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import { ChevronDown, MapPin, Lightbulb, ArrowRight } from 'lucide-react'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)

// ── Severity config ────────────────────────────────────────────────────────────
const SEV = {
  critical: {
    dot:         'bg-[#ff4d6a] shadow-[0_0_6px_#ff4d6a]',
    expandedBorder: 'border-[rgba(255,77,106,0.35)] shadow-[0_0_0_1px_rgba(255,77,106,0.1)]',
    badge:       'bg-red-500/15 text-red-400 border-red-500/25',
  },
  warning: {
    dot:         'bg-[#ffab2e] shadow-[0_0_6px_#ffab2e]',
    expandedBorder: 'border-[rgba(255,171,46,0.35)] shadow-[0_0_0_1px_rgba(255,171,46,0.1)]',
    badge:       'bg-amber-500/15 text-amber-400 border-amber-500/25',
  },
  info: {
    dot:         'bg-[#4db8ff] shadow-[0_0_6px_#4db8ff]',
    expandedBorder: 'border-[rgba(77,184,255,0.35)] shadow-[0_0_0_1px_rgba(77,184,255,0.1)]',
    badge:       'bg-blue-500/15 text-blue-400 border-blue-500/25',
  },
}

const CAT_BADGE = {
  bug:         'bg-red-500/10     text-red-400     border-red-500/20',
  security:    'bg-orange-500/10  text-orange-400  border-orange-500/20',
  performance: 'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  style:       'bg-purple-500/10  text-purple-400  border-purple-500/20',
}

// ── CodeSnippet ────────────────────────────────────────────────────────────────
function CodeSnippet({ code, lang = 'python', label, variant, isDark }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && code) {
      try {
        const result = hljs.highlight(code, { language: lang, ignoreIllegals: true })
        ref.current.innerHTML = result.value
      } catch {
        ref.current.textContent = code
      }
    }
  }, [code, lang])

  if (!code) return null

  const isBefore = variant === 'before'

  return (
    <div className={`rounded-lg overflow-hidden border ${
      isDark ? 'border-white/10' : 'border-black/10'
    } ${isBefore
      ? 'border-l-[3px] border-l-[#ff4d6a]'
      : 'border-l-[3px] border-l-[#10b981]'
    }`}>
      {/* Snippet header */}
      <div className={`px-3 py-1.5 border-b ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-black/5 border-black/10'
      }`}>
        <span className={`font-mono text-[10px] uppercase tracking-[0.07em] font-semibold ${
          isBefore ? 'text-[#ff4d6a]' : 'text-[#10b981]'
        }`}>
          {label}
        </span>
      </div>
      {/* Code */}
      <pre className="m-0 px-3 py-2.5 bg-[#0a0c10] overflow-x-auto text-[12px] leading-relaxed">
        <code ref={ref} className={`hljs language-${lang} bg-transparent p-0 font-mono`} />
      </pre>
    </div>
  )
}

// ── IssueCard ──────────────────────────────────────────────────────────────────
export default function IssueCard({ issue, index, expanded, onToggle, isDark }) {
  const {
    category, severity, line_number, title,
    description, fix_suggestion, code_before, code_after,
  } = issue

  const lang = code_before?.includes('def ') || code_before?.includes('import ')
    ? 'python'
    : 'javascript'

  const sev = SEV[severity] || SEV.info
  const catBadge = CAT_BADGE[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all duration-200
        ${isDark
          ? 'bg-[#0d1117] border-white/8 hover:border-white/15'
          : 'bg-white border-black/10 hover:border-black/20'
        }
        ${expanded ? sev.expandedBorder : ''}
      `}
      style={{ animationDelay: `${index * 0.04}s`, animation: 'fadeUp 0.3s both' }}
    >
      {/* ── Header (always visible) ── */}
      <button
        className="flex items-center justify-between w-full px-4 py-3.5 text-left gap-3 cursor-pointer bg-transparent border-none"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Severity dot */}
          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${sev.dot}`} />

          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[13px] font-medium leading-snug ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                {title}
              </span>
              {line_number && (
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
                  isDark
                    ? 'text-gray-500 bg-white/5 border-white/10'
                    : 'text-gray-500 bg-black/5 border-black/10'
                }`}>
                  <MapPin size={10} />
                  L{line_number}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${sev.badge}`}>
                {severity}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${catBadge}`}>
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform duration-200 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className={`px-4 pb-4 pt-3.5 flex flex-col gap-3 border-t ${
          isDark ? 'border-white/8' : 'border-black/8'
        }`}>

          {/* Description */}
          <p className={`text-[13px] leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>

          {/* Diff */}
          {(code_before || code_after) && (
            <div className="flex flex-col gap-2">
              <CodeSnippet code={code_before} lang={lang} label="Before" variant="before" isDark={isDark} />
              {code_before && code_after && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                </div>
              )}
              <CodeSnippet code={code_after} lang={lang} label="After" variant="after" isDark={isDark} />
            </div>
          )}

          {/* Fix suggestion */}
          {fix_suggestion && (
            <div className={`rounded-lg px-3.5 py-3 flex flex-col gap-1.5 border ${
              isDark
                ? 'bg-[rgba(232,255,90,0.04)] border-[rgba(232,255,90,0.15)]'
                : 'bg-yellow-50 border-yellow-200/60'
            }`}>
              <div className="flex items-center gap-1.5">
                <Lightbulb size={13} className={isDark ? 'text-[#e8ff5a]' : 'text-yellow-600'} />
                <span className={`font-mono text-[11px] uppercase tracking-[0.07em] font-semibold ${
                  isDark ? 'text-[#e8ff5a]' : 'text-yellow-700'
                }`}>
                  Suggested fix
                </span>
              </div>
              <p className={`text-[13px] leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {fix_suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}