import React, { useState, useCallback } from 'react'
import axios from 'axios'
import CodeEditor from '../components/CodeEditor'
import ReviewResults from '../components/ReviewResults'
import ScoreRing from '../components/ScoreRing'
import styles from './ReviewPage.module.css'
import { Upload, Play, RotateCcw, FileCode } from 'lucide-react'

const SAMPLE_CODE = `import sqlite3
import os

SECRET_KEY = "hardcoded-secret-key-abc123"

def get_user(user_id):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchone()

def process_users():
    users = get_all_users()
    results = []
    for user in users:
        data = get_user(user["id"])
        results.append(data)
    return results

def calculate(a, b, c, d, e, f):
    x = a + b + c + d + e + f
    y = a * b * c * d * e * f
    z = x / y
    return z

def authenticate(username, password):
    if password == "admin123":
        return True
    user = get_user(username)
    if user:
        return user.password == password
    return False
`

export default function ReviewPage() {
  const [code, setCode] = useState('')
  const [filename, setFilename] = useState('main.py')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
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
    setCode('')
    setResult(null)
    setError(null)
  }

  const handleFile = (file) => {
    if (!file) return
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target.result)
    reader.readAsText(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Code Review</h1>
          <p className={styles.subtitle}>
            Paste or upload Python / JavaScript code for AI-powered analysis
          </p>
        </div>
        {result && (
          <div className={styles.headerScore}>
            <ScoreRing score={result.score} size={56} />
          </div>
        )}
      </header>

      <div className={styles.workspace}>
        {/* Editor panel */}
        <div className={styles.editorPanel}>
          <div className={styles.editorToolbar}>
            <div className={styles.filenameWrapper}>
              <FileCode size={13} color="var(--text-muted)" />
              <input
                className={styles.filenameInput}
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="filename.py"
              />
            </div>
            <div className={styles.toolbarActions}>
              <label className={styles.uploadBtn}>
                <Upload size={13} />
                <span>Upload</span>
                <input
                  type="file"
                  accept=".py,.js,.ts,.jsx,.tsx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </label>
              <button
                className={styles.sampleBtn}
                onClick={() => { setCode(SAMPLE_CODE); setFilename('main.py') }}
              >
                Load sample
              </button>
              {code && (
                <button className={styles.resetBtn} onClick={handleReset}>
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>

          <div
            className={`${styles.editorWrap} ${dragging ? styles.dragging : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!code && (
              <div className={styles.dropHint}>
                <Upload size={24} color="var(--text-dim)" />
                <span>Drop a file here or start typing</span>
              </div>
            )}
            <CodeEditor value={code} onChange={setCode} language={filename.endsWith('.py') ? 'python' : 'javascript'} />
          </div>

          <div className={styles.editorFooter}>
            <span className={styles.lineCount}>
              {code ? `${code.split('\n').length} lines` : '—'}
            </span>
            <button
              className={styles.reviewBtn}
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <div className={styles.spinner} />
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

        {/* Results panel */}
        <div className={styles.resultsPanel}>
          {error && (
            <div className={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}
          {!result && !loading && !error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Play size={28} />
              </div>
              <h3>Ready to review</h3>
              <p>Paste your code, then hit Run Review. The agent will check for bugs, security issues, performance problems, and style violations.</p>
            </div>
          )}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingBar}>
                <div className={styles.loadingProgress} />
              </div>
              <div className={styles.loadingSteps}>
                {['Parsing code…', 'Running analysis…', 'Generating fixes…'].map((s, i) => (
                  <div key={i} className={styles.loadingStep} style={{ animationDelay: `${i * 0.4}s` }}>
                    <div className={styles.loadingDot} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result && <ReviewResults result={result} />}
        </div>
      </div>
    </div>
  )
}
