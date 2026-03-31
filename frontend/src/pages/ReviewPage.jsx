import React, { useState, useCallback } from 'react'
import axios from 'axios'
import CodeEditor from '../components/CodeEditor'
import ReviewResults from '../components/ReviewResults'
import ScoreRing from '../components/ScoreRing'
import { Upload, Play, RotateCcw, FileCode } from 'lucide-react'
import {
  LANGUAGE_PROFILES,
  detectLanguage,
  syncFilenameExtension,
} from '../Requirements/Language'

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

// ── Derive editor language from filename extension as fallback ──
// Used when auto-detection hasn't fired yet (e.g. on first paste)
function getLangFromFilename(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const match = LANGUAGE_PROFILES.find(l => l.extension === `.${ext}`)
  return match?.editorLang || 'plaintext'
}

export default function ReviewPage() {
  const [code, setCode]                 = useState('')
  const [filename, setFilename]         = useState('main.py')
  const [loading, setLoading]           = useState(false)
  const [result, setResult]             = useState(null)
  const [error, setError]               = useState(null)
  const [dragging, setDragging]         = useState(false)
  const [detectedLang, setDetectedLang] = useState(null)    // detect language on the editor

  // Detected lang always wins; fallback derives from filename extension
  const activeEditorLang = detectedLang?.editorLang || getLangFromFilename(filename)
  const acceptedExtensions = LANGUAGE_PROFILES.map(l => l.extension).join(',')

  // ── Handle code changes (typing or pasting) ──────────────────
  const handleCodeChange = (newCode) => {
    setCode(newCode)

    if (!newCode.trim()) {
      setDetectedLang(null)
      return
    }

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

  // ── File upload: trust the file's own extension ──────────────
  const handleFile = (file) => {
    if (!file) return
    setFilename(file.name)
    // Find and set the profile from the file extension immediately
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

  const handleDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-8 pt-7 pb-5 border-b border-gray-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Code Review</h1>
          <p className="text-sm text-gray-400 font-light mt-0.5">
            Paste or upload code for AI-powered analysis
          </p>
        </div>
        {result && <ScoreRing score={result.score} size={56} />}
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Editor Panel */}
        <div className="flex flex-col w-1/2 border-r border-gray-800">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FileCode size={13} className="text-gray-400 flex-shrink-0" />
              <input
                className="bg-transparent font-mono text-sm text-white placeholder-gray-500 outline-none w-36 truncate"
                value={filename}
                onChange={(e) => {
                  const newName = e.target.value
                  setFilename(newName)
                  // Re-derive language from the new extension as user types
                  const ext = '.' + newName.split('.').pop().toLowerCase()
                  const profile = LANGUAGE_PROFILES.find(l => l.extension === ext)
                  setDetectedLang(profile || null)
                }}
                placeholder="filename.py"
              />
              {/* Language badge — shows detected or extension-derived language */}
              {detectedLang && (
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${detectedLang.badgeClass}`}>
                  {detectedLang.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors">
                <Upload size={13} />
                <span>Upload</span>
                <input type="file" accept={acceptedExtensions} className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])} />
              </label>
              <button
                className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md px-2.5 py-1.5 transition-colors"
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
                  className="text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md p-1.5 transition-colors"
                  onClick={handleReset}
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Editor */}
          <div
            className={`relative flex-1 overflow-hidden transition-all duration-150 ${
              dragging ? 'ring-2 ring-inset ring-blue-500 bg-blue-950/20' : ''
            }`}
            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
          >
            {!code && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-600 pointer-events-none z-10">
                <Upload size={24} />
                <span className="text-sm">Drop a file here or start typing</span>
              </div>
            )}
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={activeEditorLang}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900 flex-shrink-0">
            {/* Line count + active language indicator */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-500">
                {code ? `${code.split('\n').length} lines` : '—'}
              </span>
              {activeEditorLang && activeEditorLang !== 'plaintext' && (
                <span className="font-mono text-xs text-gray-600">
                  {activeEditorLang}
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Run Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-300 text-sm">
              <span>⚠</span> {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 px-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
                <Play size={28} />
              </div>
              <h3 className="text-base font-semibold text-white">Ready to review</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Paste your code, then hit Run Review. The agent will check for bugs,
                security issues, performance problems, and style violations.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-sm">
                {LANGUAGE_PROFILES.map(lang => (
                  <span key={lang.name} className={`text-xs px-2 py-0.5 rounded-full font-medium ${lang.badgeClass}`}>
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 px-10">
              <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <div className="flex flex-col gap-3">
                {['Parsing code…', 'Running analysis…', 'Generating fixes…'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.4}s` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && <div className="p-6"><ReviewResults result={result} /></div>}
        </div>
      </div>
    </div>
  )
}