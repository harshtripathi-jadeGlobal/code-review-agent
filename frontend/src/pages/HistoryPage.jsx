import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ScoreRing from '../components/ScoreRing'
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
    <div className="min-h-screen bg-gray-950 text-white px-6 py-8">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Review History</h1>
        <p className="text-gray-400 text-sm mt-1">All past code submissions and their results</p>
      </header>

      {/* Stats Row */}
      {stats && (
        <div className="grid  grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="text-blue-400"><BarChart3 size={16} /></div>
            <div>
              <div className="text-xl font-bold">{stats.total_reviews}</div>
              <div className="text-xs text-gray-400">Reviews</div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="text-yellow-400"><AlertTriangle size={16} /></div>
            <div>
              <div className="text-xl font-bold">{stats.total_issues}</div>
              <div className="text-xs text-gray-400">Issues Found</div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="text-green-400"><TrendingUp size={16} /></div>
            <div>
              <div className="text-xl font-bold">{stats.avg_score}</div>
              <div className="text-xs text-gray-400">Avg Score</div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="text-red-400"><Shield size={16} /></div>
            <div>
              <div className="text-xl font-bold">{stats.critical_total}</div>
              <div className="text-xs text-gray-400">Critical Issues</div>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div>
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm">Loading history…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
            <Clock size={28} />
            <h3 className="text-white font-semibold text-lg">No reviews yet</h3>
            <p className="text-sm">Run your first code review to see results here.</p>
          </div>
        )}

        {/* History List */}
        {!loading && history.length > 0 && (
          <div className="flex flex-col gap-3">
            {history.map((item, i) => (
              <button
                key={item.review_id}
                onClick={() => navigate(`/history/${item.review_id}`)}
                style={{ animationDelay: `${i * 0.04}s` }}
                className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 flex items-center justify-between transition-all duration-200 text-left"
              >
                {/* Left side */}
                <div className="flex items-center gap-3">
                  <div className="bg-gray-800 p-2 rounded-lg text-gray-400">
                    <FileCode size={15} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.filename}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Language Badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.language === 'python'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-purple-900/50 text-purple-300'
                      }`}>
                        {item.language}
                      </span>
                      {/* Time */}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} />
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {item.critical_count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 font-medium">
                        {item.critical_count} critical
                      </span>
                    )}
                    {item.warning_count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-300 font-medium">
                        {item.warning_count} warning
                      </span>
                    )}
                    {item.info_count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 font-medium">
                        {item.info_count} info
                      </span>
                    )}
                  </div>
                  <ScoreRing score={item.score} size={44} />
                  <ChevronRight size={15} className="text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}