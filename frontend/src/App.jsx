import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './pages/Navbar'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import StatsDashboard from './pages/StatisticDashboard'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import GithubCallback from './pages/GithubCallback'
import { useAuth } from './context/AuthContext'
import axios from 'axios'

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return currentUser ? children : <Navigate to="/login" />;
}

export default function App() {

  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    setLoadingData(true);
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
          'Could not load history or statistics.'
        )
      )
      .finally(() => setLoadingData(false))
  }, [currentUser])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0d1017]">
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />

          <Route path="/" element={<PrivateRoute><ReviewPage /></PrivateRoute>} />
          
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <HistoryPage
                  stats={stats}
                  history={history}
                  loading={loadingData}
                  error={error}
                />
              </PrivateRoute>
            }
          />

          <Route path="/history/:id" element={<PrivateRoute><ReviewDetailPage /></PrivateRoute>} />

          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <StatsDashboard
                  stats={stats}
                  loading={loadingData}
                  error={error}
                />
              </PrivateRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />

        </Routes>
      </div>
    </div>
  )
}