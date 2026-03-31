import React, { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import styles from './IssueCard.module.css'
import { ChevronDown, MapPin, Lightbulb, ArrowRight } from 'lucide-react'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)

function CodeSnippet({ code, lang = 'python', label, variant }) {
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
  return (
    <div className={`${styles.snippet} ${styles[`snippet_${variant}`]}`}>
      <div className={styles.snippetHeader}>
        <span className={styles.snippetLabel}>{label}</span>
      </div>
      <pre className={styles.snippetPre}>
        <code ref={ref} className={`hljs language-${lang}`} />
      </pre>
    </div>
  )
}

export default function IssueCard({ issue, index, expanded, onToggle }) {
  const {
    category, severity, line_number, title,
    description, fix_suggestion, code_before, code_after
  } = issue

  const lang = code_before?.includes('def ') || code_before?.includes('import ') ? 'python' : 'javascript'

  return (
    <div
      className={`${styles.card} ${styles[`sev_${severity}`]} ${expanded ? styles.expanded : ''}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Card header — always visible */}
      <button className={styles.header} onClick={onToggle}>
        <div className={styles.headerLeft}>
          <div className={`${styles.sevDot} ${styles[`dot_${severity}`]}`} />
          <div className={styles.meta}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{title}</span>
              {line_number && (
                <span className={styles.lineTag}>
                  <MapPin size={10} />
                  L{line_number}
                </span>
              )}
            </div>
            <div className={styles.badges}>
              <span className={`badge badge-${severity}`}>{severity}</span>
              <span className={`badge badge-${category}`}>{category}</span>
            </div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={styles.chevron}
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className={styles.body}>
          <p className={styles.description}>{description}</p>

          {(code_before || code_after) && (
            <div className={styles.diff}>
              <CodeSnippet code={code_before} lang={lang} label="Before" variant="before" />
              {code_before && code_after && (
                <div className={styles.diffArrow}>
                  <ArrowRight size={16} color="var(--text-dim)" />
                </div>
              )}
              <CodeSnippet code={code_after} lang={lang} label="After" variant="after" />
            </div>
          )}

          {fix_suggestion && (
            <div className={styles.fix}>
              <div className={styles.fixHeader}>
                <Lightbulb size={13} color="var(--accent)" />
                <span>Suggested fix</span>
              </div>
              <p className={styles.fixText}>{fix_suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
