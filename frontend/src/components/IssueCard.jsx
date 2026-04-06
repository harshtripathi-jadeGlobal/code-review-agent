import React, { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import { ChevronDown, MapPin, Lightbulb, ArrowDown, Copy, Check } from 'lucide-react'

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

// ── Copy button hook ───────────────────────────────────────────────────────────
function CopyButton({ text, isDark }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 cursor-pointer ${
        copied
          ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
          : isDark
            ? 'text-gray-400 bg-white/5 border-white/10 hover:text-gray-200 hover:bg-white/10 hover:border-white/20'
            : 'text-gray-500 bg-black/5 border-black/10 hover:text-gray-700 hover:bg-black/10'
      }`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
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
    <div className={`rounded-xl overflow-hidden border ${
      isDark ? 'border-white/10' : 'border-black/10'
    } ${isBefore
      ? 'border-l-[3px] border-l-[#ff4d6a]'
      : 'border-l-[3px] border-l-[#10b981]'
    }`}>
      {/* Snippet header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-black/5 border-black/10'
      }`}>
        <span className={`font-mono text-[10px] uppercase tracking-[0.07em] font-bold ${
          isBefore ? 'text-[#ff4d6a]' : 'text-[#10b981]'
        }`}>
          {label}
        </span>
        <CopyButton text={code} isDark={isDark} />
      </div>
      {/* Code */}
      <pre className="m-0 px-4 py-3 bg-[#0a0c10] overflow-x-auto text-[12px] leading-relaxed">
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

  // Build a plain-text summary for the "Copy Issue" button
  const issuePlainText = [
    `[${severity?.toUpperCase()}] ${title}`,
    line_number ? `Line: ${line_number}` : '',
    `Category: ${category}`,
    '',
    description,
    '',
    code_before ? `Before:\n${code_before}` : '',
    code_after ? `After:\n${code_after}` : '',
    '',
    fix_suggestion ? `Fix: ${fix_suggestion}` : '',
  ].filter(Boolean).join('\n')

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
        className="flex items-center justify-between w-full text-left gap-4 cursor-pointer bg-transparent border-none"
        style={{ padding: '14px 20px' }}
        onClick={onToggle}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Severity dot */}
          <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${sev.dot}`} />

          <div className="flex flex-col gap-2 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-sm font-semibold leading-snug ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                {title}
              </span>
              {line_number && (
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap ${
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
            <div className="flex gap-2 flex-wrap">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${sev.badge}`}>
                {severity}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${catBadge}`}>
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
        <div
          className={`flex flex-col border-t ${
            isDark ? 'border-white/8' : 'border-black/8'
          }`}
          style={{ padding: '16px 20px 20px 20px', gap: '16px' }}
        >

          {/* Description */}
          <p className={`text-sm leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`} style={{ margin: 0 }}>
            {description}
          </p>

          {/* Diff */}
          {(code_before || code_after) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CodeSnippet code={code_before} lang={lang} label="Before" variant="before" isDark={isDark} />
              {code_before && code_after && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                </div>
              )}
              <CodeSnippet code={code_after} lang={lang} label="After" variant="after" isDark={isDark} />
            </div>
          )}

          {/* Fix suggestion */}
          {fix_suggestion && (
            <div className={`rounded-xl border ${
              isDark
                ? 'bg-[rgba(232,255,90,0.04)] border-[rgba(232,255,90,0.15)]'
                : 'bg-yellow-50 border-yellow-200/60'
            }`} style={{ padding: '14px 16px' }}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className={isDark ? 'text-[#e8ff5a]' : 'text-yellow-600'} />
                <span className={`font-mono text-[11px] uppercase tracking-[0.07em] font-bold ${
                  isDark ? 'text-[#e8ff5a]' : 'text-yellow-700'
                }`}>
                  Suggested fix
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`} style={{ margin: 0 }}>
                {fix_suggestion}
              </p>
            </div>
          )}

          {/* Copy entire issue button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <CopyButton text={issuePlainText} isDark={isDark} />
          </div>
        </div>
      )}
    </div>
  )
}