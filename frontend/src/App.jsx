import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ReviewPage from './pages/ReviewPage'
import HistoryPage from './pages/HistoryPage'
import ReviewDetailPage from './pages/ReviewDetailPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ReviewPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<ReviewDetailPage />} />
      </Routes>
    </Layout>
  )
}
