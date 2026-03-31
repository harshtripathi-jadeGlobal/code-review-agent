import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ScoreRing from '../components/ScoreRing'
import styles from './HistoryPage.module.css'
import { Clock, FileCode, ChevronRight, BarChart3, AlertTriangle, TrendingUp, Shield } from 'lucide-react'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      axios.get('/api/history'),
      axios.get('/api/stats'),
    ])
      .then(([h, s]) => {
        setHistory(h.data)
        setStats(s.data)
      })
      .catch(() => setError('Could not load history. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Review History</h1>
          <p className={styles.subtitle}>All past code submissions and their results</p>
        </div>
      </header>

      {/* Stats row */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><BarChart3 size={16} /></div>
            <div>
              <div className={styles.statNum}>{stats.total_reviews}</div>
              <div className={styles.statLabel}>Reviews</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: 'var(--warning)' }}><AlertTriangle size={16} /></div>
            <div>
              <div className={styles.statNum}>{stats.total_issues}</div>
              <div className={styles.statLabel}>Issues Found</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: 'var(--success)' }}><TrendingUp size={16} /></div>
            <div>
              <div className={styles.statNum}>{stats.avg_score}</div>
              <div className={styles.statLabel}>Avg Score</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: 'var(--critical)' }}><Shield size={16} /></div>
            <div>
              <div className={styles.statNum}>{stats.critical_total}</div>
              <div className={styles.statLabel}>Critical Issues</div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.body}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading history…</span>
          </div>
        )}

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className={styles.empty}>
            <Clock size={28} color="var(--text-dim)" />
            <h3>No reviews yet</h3>
            <p>Run your first code review to see results here.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className={styles.list}>
            {history.map((item, i) => (
              <button
                key={item.review_id}
                className={styles.historyRow}
                onClick={() => navigate(`/history/${item.review_id}`)}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className={styles.rowLeft}>
                  <div className={styles.fileIcon}>
                    <FileCode size={15} />
                  </div>
                  <div className={styles.rowMeta}>
                    <div className={styles.rowFilename}>{item.filename}</div>
                    <div className={styles.rowSub}>
                      <span className={`badge badge-${item.language === 'python' ? 'style' : 'performance'}`}>
                        {item.language}
                      </span>
                      <span className={styles.rowTime}>
                        <Clock size={11} />
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.rowRight}>
                  <div className={styles.rowCounts}>
                    {item.critical_count > 0 && (
                      <span className={`badge badge-critical`}>{item.critical_count} critical</span>
                    )}
                    {item.warning_count > 0 && (
                      <span className={`badge badge-warning`}>{item.warning_count} warning</span>
                    )}
                    {item.info_count > 0 && (
                      <span className={`badge badge-info`}>{item.info_count} info</span>
                    )}
                  </div>
                  <ScoreRing score={item.score} size={44} />
                  <ChevronRight size={15} color="var(--text-dim)" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
