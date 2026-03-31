import React, { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import styles from './CodeEditor.module.css'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)

export default function CodeEditor({ value, onChange, language = 'python' }) {
  const textareaRef = useRef(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    if (highlightRef.current) {
      const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      try {
        const result = hljs.highlight(escaped, { language, ignoreIllegals: true })
        highlightRef.current.innerHTML = result.value + '\n'
      } catch {
        highlightRef.current.textContent = value
      }
    }
  }, [value, language])

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newVal = value.substring(0, start) + '    ' + value.substring(end)
      onChange(newVal)
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      })
    }
  }

  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const lines = value ? value.split('\n').length : 1

  return (
    <div className={styles.editor}>
      {/* Line numbers */}
      <div className={styles.lineNumbers} aria-hidden>
        {Array.from({ length: Math.max(lines, 20) }, (_, i) => (
          <div key={i} className={styles.lineNum}>{i + 1}</div>
        ))}
      </div>

      {/* Highlighted overlay */}
      <div className={styles.codeArea}>
        <pre
          ref={highlightRef}
          className={`${styles.highlight} hljs language-${language}`}
          aria-hidden
        />
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="// paste your code here…"
        />
      </div>
    </div>
  )
}
