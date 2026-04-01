import React, { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import ReviewResults from '../components/ReviewResults'
import ScoreRing from '../components/ScoreRing'
import { Upload, Play, RotateCcw, FileCode, Sparkles } from 'lucide-react'
import {
  LANGUAGE_PROFILES,
  detectLanguage,
  syncFilenameExtension,
} from '../Requirements/Language'

// Run once: npm install highlight.js
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/atom-one-dark.css'

import hljsPython from 'highlight.js/lib/languages/python'
import hljsJavaScript from 'highlight.js/lib/languages/javascript'
import hljsTypeScript from 'highlight.js/lib/languages/typescript'
import hljsJava from 'highlight.js/lib/languages/java'
import hljsCpp from 'highlight.js/lib/languages/cpp'
import hljsC from 'highlight.js/lib/languages/c'
import hljsCsharp from 'highlight.js/lib/languages/csharp'
import hljsGo from 'highlight.js/lib/languages/go'
import hljsRust from 'highlight.js/lib/languages/rust'
import hljsPhp from 'highlight.js/lib/languages/php'
import hljsRuby from 'highlight.js/lib/languages/ruby'
import hljsSwift from 'highlight.js/lib/languages/swift'
import hljsKotlin from 'highlight.js/lib/languages/kotlin'
import hljsScala from 'highlight.js/lib/languages/scala'
import hljsXml from 'highlight.js/lib/languages/xml'
import hljsCss from 'highlight.js/lib/languages/css'
import hljsSql from 'highlight.js/lib/languages/sql'
import hljsBash from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('python', hljsPython)
hljs.registerLanguage('javascript', hljsJavaScript)
hljs.registerLanguage('typescript', hljsTypeScript)
hljs.registerLanguage('java', hljsJava)
hljs.registerLanguage('cpp', hljsCpp)
hljs.registerLanguage('c', hljsC)
hljs.registerLanguage('csharp', hljsCsharp)
hljs.registerLanguage('go', hljsGo)
hljs.registerLanguage('rust', hljsRust)
hljs.registerLanguage('php', hljsPhp)
hljs.registerLanguage('ruby', hljsRuby)
hljs.registerLanguage('swift', hljsSwift)
hljs.registerLanguage('kotlin', hljsKotlin)
hljs.registerLanguage('scala', hljsScala)
hljs.registerLanguage('html', hljsXml)
hljs.registerLanguage('xml', hljsXml)
hljs.registerLanguage('css', hljsCss)
hljs.registerLanguage('sql', hljsSql)
hljs.registerLanguage('bash', hljsBash)

const SAMPLE_CODE = `import sqlite3
import os

SECRET_KEY = "hardcoded-secret-key-abc123"

def get_user(user_id):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchone()

def authenticate(username, password):
    if password == "admin123":
        return True
    user = get_user(username)
    if user:
        return user.password == password
    return False
`

// Map our language profile names → hljs language identifiers
const HLJS_LANG_MAP = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  html: 'html',
  css: 'css',
  sql: 'sql',
  bash: 'bash',
  plaintext: 'plaintext',
}

function getLangFromFilename(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const match = LANGUAGE_PROFILES.find(l => l.extension === `.${ext}`)
  return match?.editorLang || 'plaintext'
}

// ── Syntax-highlighted editor (textarea + pre overlay trick) ──────────────────
function SyntaxEditor({ value, onChange, language, onDrop, onDragOver, onDragLeave, dragging }) {
  const textareaRef = useRef(null)
  const preRef = useRef(null)
  const [highlighted, setHighlighted] = useState('')

  // Re-highlight whenever code or language changes
  useEffect(() => {
    if (!value) { setHighlighted(''); return }

    const hljsLang = HLJS_LANG_MAP[language] || 'plaintext'

    try {
      let result
      if (hljsLang !== 'plaintext' && hljs.getLanguage(hljsLang)) {
        result = hljs.highlight(value, { language: hljsLang })
      } else {
        result = hljs.highlightAuto(value)
      }
      setHighlighted(result.value)
    } catch {
      setHighlighted(
        value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      )
    }
  }, [value, language])

  // Sync scroll between textarea and pre
  const syncScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop
      preRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  // Handle Tab key inside textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = textareaRef.current
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newVal = value.substring(0, start) + '    ' + value.substring(end)
      onChange(newVal)
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }

  const sharedStyle = {
    fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
    fontSize: '13.5px',
    lineHeight: '1.65',
    letterSpacing: '0.01em',
    tabSize: 4,
    padding: '16px 20px',
    margin: 0,
    border: 'none',
    outline: 'none',
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    wordWrap: 'normal',
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{
        background: '#0d1117',
        outline: dragging ? '2px solid rgba(59,130,246,0.6)' : 'none',
        outlineOffset: '-2px',
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* ── Highlighted layer (behind) ── */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className="hljs"
        style={{
          ...sharedStyle,
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1,
          background: 'transparent',
          color: value ? undefined : 'transparent',
        }}
        dangerouslySetInnerHTML={{
          __html: highlighted ||
            value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;'),
        }}
      />

      {/* ── Editable textarea (on top, transparent text) ── */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        style={{
          ...sharedStyle,
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background: 'transparent',
          color: 'transparent',
          caretColor: '#e2e8f0',
          resize: 'none',
          overflow: 'auto',
        }}
      />

      {/* Drop / empty hint */}
      {!value && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Upload size={20} className="text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Drop a file or paste code</p>
            <p className="text-xs text-gray-700 mt-0.5">Supports 17 languages</p>
          </div>
        </div>
      )}
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [code, setCode] = useState('')
  const [filename, setFilename] = useState('main.py')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [detectedLang, setDetectedLang] = useState(null)

  const activeEditorLang = detectedLang?.editorLang || getLangFromFilename(filename)
  const acceptedExtensions = LANGUAGE_PROFILES.map(l => l.extension).join(',')

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    if (!newCode.trim()) { setDetectedLang(null); return }
    const lang = detectLanguage(newCode)
    if (lang) {
      setDetectedLang(lang)
      setFilename(prev => syncFilenameExtension(prev, lang.extension))
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const { data } = await axios.post('/api/review', { code, filename })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Review failed. Check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCode(''); setResult(null); setError(null)
    setDetectedLang(null); setFilename('main.py')
  }

  const handleFile = (file) => {
    if (!file) return
    setFilename(file.name)
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    const profile = LANGUAGE_PROFILES.find(l => l.extension === ext)
    setDetectedLang(profile || null)
    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target.result)
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"

    >

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-sm"

      >
        {result && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Quality Score</span>
            <ScoreRing score={result.score} size={52} />
          </div>
        )}
      </header>

      {/* ── Workspace ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════ Editor Panel ════════════ */}
        <div className="flex flex-col w-1/2 border-r border-white/5">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0c1018] flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-sm bg-white/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <FileCode size={13} className="text-gray-400" />
              </div>
              <input
                className="bg-transparent font-mono text-lg text-gray-200 placeholder-gray-600 outline-none  w-36 truncate"
                value={filename}
                onChange={(e) => {
                  const newName = e.target.value
                  setFilename(newName)
                  const ext = '.' + newName.split('.').pop().toLowerCase()
                  const profile = LANGUAGE_PROFILES.find(l => l.extension === ext)
                  setDetectedLang(profile || null)
                }}
                placeholder="filename.py"
              />
              {detectedLang && (
                <span className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${detectedLang.badgeClass}`}>
                  {detectedLang.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-8">
              <label className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-gray-200 hover:bg-white/5 rounded-md px-2.5 py-1.5 cursor-pointer transition-all border border-transparent hover:border-white/10">
                <Upload className='text-[14px]' />
                <span>Upload</span>
                <input type="file" accept={acceptedExtensions} className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])} />
              </label>
              <button
                className="text-sm text-gray-200 hover:text-gray-200 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md px-2.5 py-1.5 transition-all"
                onClick={() => {
                  setCode(SAMPLE_CODE)
                  setFilename('main.py')
                  setDetectedLang(LANGUAGE_PROFILES.find(l => l.name === 'python'))
                }}
              >
                Load sample
              </button>
              {code && (
                <button
                  className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-md p-1.5 transition-all"
                  onClick={handleReset}
                  title="Clear editor"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>

          {/* ── Syntax editor ── */}
          <SyntaxEditor
            value={code}
            onChange={handleCodeChange}
            language={activeEditorLang}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            dragging={dragging}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-[#0c1018] flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-600">
                {code ? `${code.split('\n').length} lines` : 'empty'}
              </span>
              {activeEditorLang && activeEditorLang !== 'plaintext' && (
                <>
                  <span className="w-px h-3 bg-white/10" />
                  <span className="font-mono text-xs text-gray-600">{activeEditorLang}</span>
                </>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="
    flex items-center gap-2 
    px-10 py-4 
    rounded-lg text-sm font-semibold
    text-amber-100 bg-blue-600
    border border-blue-400/50
    hover:bg-blue-500 active:bg-blue-700
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-all duration-200
  "
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Play size={14} />
                  Run Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* ════════════ Results Panel ════════════ */}
        <div className="flex flex-col flex-1  w-full overflow-y-auto bg-[#080b10]">

          {error && (
            <div className="mx-6 mt-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <span className="text-base leading-none mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center flex-1 gap-5 px-10 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-150" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                  <Sparkles size={26} className="text-blue-400" />
                </div>
              </div>
              <div className='text-amber-50'>
                <h3 className="text-lg font-semibold text-">Ready to review</h3>
                <p className="text-sm  max-w-xs leading-relaxed mt-1.5">
                  Paste your code on the left, then hit{' '}
                  <span className="text-blue-400 font-medium">Run Review</span>.
                  The agent checks for bugs, security flaws, performance issues, and style violations.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-600">supported languages</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="flex flex-wrap justify-center gap-1.5  max-w-sm">
                {LANGUAGE_PROFILES.map(lang => (
                  <span
                    key={lang.name}
                    className={`text-sm px-16 py-6 rounded-xl font-semibold tracking-wide ${lang.badgeClass}`}                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 px-10">
              <div className="w-full max-w-xs">
                <div className="h-px bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{
                      width: '65%',
                      background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      boxShadow: '0 0 10px rgba(59,130,246,0.8)',
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {['Parsing code…', 'Running analysis…', 'Generating fixes…'].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-500 animate-pulse"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="p-8">
              <ReviewResults result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}