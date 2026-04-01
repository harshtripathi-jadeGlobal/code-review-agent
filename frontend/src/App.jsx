import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './pages/Navbar'   // ✅ add navbar
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import StatsDashboard from './pages/StatisticDashboard'
import axios from 'axios'

export default function App() {

  // 🔥 state
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 🔥 API call
  useEffect(() => {
    Promise.all([
      axios.get('/api/history'),
      axios.get('/api/stats'),
    ])
      .then(([h, s]) => {
        setHistory(h.data)
        setStats(s.data)
      })
      .catch(() =>
        setError(
          'Could not load history or statistics. Make sure the backend is running.'
        )
      )
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen overflow-hidden" >

      {/* ✅ TOP NAVBAR */}
      <Navbar />

      {/* ✅ PAGE CONTENT */}
      <div className="px-6 py-6">
        <Routes>

          {/* Home */}
          <Route path="/" element={<ReviewPage />} />

          {/* History */}
          <Route
            path="/history"
            element={
              <HistoryPage
                stats={stats}
                history={history}
                loading={loading}
                error={error}
              />
            }
          />

          {/* Detail */}
          <Route path="/history/:id" element={<ReviewDetailPage />} />

          {/* Optional pages */}
          <Route
            path="/stats"
            element={
              <StatsDashboard
                stats={stats}
                loading={loading}
                error={error}
              />
            }
          />
          <Route path="/about" element={<div>About Page</div>} />

        </Routes>
      </div>

    </div>
  )
}