import React, { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'

// Register all languages that LANGUAGE_PROFILES supports
import python     from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import java       from 'highlight.js/lib/languages/java'
import cpp        from 'highlight.js/lib/languages/cpp'
import c          from 'highlight.js/lib/languages/c'
import rust       from 'highlight.js/lib/languages/rust'
import go         from 'highlight.js/lib/languages/go'
import ruby       from 'highlight.js/lib/languages/ruby'
import php        from 'highlight.js/lib/languages/php'
import swift      from 'highlight.js/lib/languages/swift'
import kotlin     from 'highlight.js/lib/languages/kotlin'
import sql        from 'highlight.js/lib/languages/sql'
import css        from 'highlight.js/lib/languages/css'
import xml        from 'highlight.js/lib/languages/xml'   // handles HTML
import bash       from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('python',     python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('java',       java)
hljs.registerLanguage('cpp',        cpp)
hljs.registerLanguage('c',          c)
hljs.registerLanguage('rust',       rust)
hljs.registerLanguage('go',         go)
hljs.registerLanguage('ruby',       ruby)
hljs.registerLanguage('php',        php)
hljs.registerLanguage('swift',      swift)
hljs.registerLanguage('kotlin',     kotlin)
hljs.registerLanguage('sql',        sql)
hljs.registerLanguage('css',        css)
hljs.registerLanguage('html',       xml)
hljs.registerLanguage('shell',      bash)

// ── Inline styles for properties Tailwind can't express ─────
const EDITOR_STYLES = {
  textarea: {
    caretColor: '#e8ff5a',          // bright yellow cursor
    WebkitTextFillColor: 'transparent', // hides typed text (highlight shows through)
    tabSize: 4,
    MozTabSize: 4,
  },
  pre: {
    tabSize: 4,
    MozTabSize: 4,
    background: 'transparent',     // override hljs theme background
  },
}

// ── Line height and font size as JS constants ────────────────
// Used in both Tailwind classes and the line number height calc
const FONT_SIZE   = 13  // px
const LINE_HEIGHT = 1.65
const LINE_PX     = FONT_SIZE * LINE_HEIGHT  // 21.45px per line

export default function CodeEditor({ value, onChange, language = 'python' }) {
  const textareaRef  = useRef(null)
  const highlightRef = useRef(null)

  // ── Syntax highlight whenever code or language changes ──────
  useEffect(() => {
    if (!highlightRef.current) return

    // Escape HTML entities before passing to hljs
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    try {
      const result = hljs.highlight(escaped, { language, ignoreIllegals: true })
      // Trailing \n ensures last line has correct height
      highlightRef.current.innerHTML = result.value + '\n'
    } catch {
      // Fallback: plain text if language isn't registered
      highlightRef.current.textContent = value
    }
  }, [value, language])

  // ── Tab key: insert 4 spaces instead of losing focus ────────
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start  = e.target.selectionStart
      const end    = e.target.selectionEnd
      const newVal = value.substring(0, start) + '    ' + value.substring(end)
      onChange(newVal)
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4
      })
    }
  }

  // ── Keep highlight layer in sync with textarea scroll ───────
  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop  = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const lineCount = value ? value.split('\n').length : 1
  // Show at least 20 line numbers so editor doesn't look empty
  const totalLines = Math.max(lineCount, 20)

  return (
    <div className="flex h-full overflow-hidden font-mono bg-[#0d1117]"
         style={{ fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT }}>

      {/* ── Line Numbers ── */}
      <div
        className="flex-shrink-0 w-12 py-3.5 overflow-hidden select-none border-r border-[#1e2330]"
        style={{ background: '#0a0c10' }}
        aria-hidden
      >
        {Array.from({ length: totalLines }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-end pr-3 text-[11px] text-[#3d4458]"
            style={{ height: LINE_PX }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* ── Code Area ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Syntax highlight layer — purely visual, no pointer events */}
        <pre
          ref={highlightRef}
          className={`
            absolute inset-0 m-0 px-4 py-3.5
            overflow-auto whitespace-pre
            pointer-events-none select-none
            font-mono text-[#adbac7]
            hljs language-${language}
          `}
          style={{ fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT, ...EDITOR_STYLES.pre }}
          aria-hidden
        />

        {/* Textarea — sits on top, captures all input, text is invisible */}
        <textarea
          ref={textareaRef}
          className="
            absolute inset-0 w-full h-full
            px-4 py-3.5
            bg-transparent border-none outline-none resize-none
            font-mono text-transparent
            overflow-auto whitespace-pre
            placeholder-[#3d4458]
          "
          style={{ fontSize: FONT_SIZE, lineHeight: LINE_HEIGHT, ...EDITOR_STYLES.textarea }}
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