import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import axios from 'axios'

export default function App() {

  // calling llm api here for statistical data
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
  console.log("stats", stats)
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ReviewPage />} />
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
        />        <Route path="/history/:id" element={<ReviewDetailPage />} />
      </Routes>
    </Layout>
  )
}
