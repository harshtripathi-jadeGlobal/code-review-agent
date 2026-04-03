import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReviewResults from '../components/ReviewResults'
import ScoreRing from '../components/ScoreRing'
import { ArrowLeft, FileCode, Clock } from 'lucide-react'

export default function ReviewDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`/api/history/${id}`)
      .then(r => setReview(r.data))
      .catch(() => setError('Could not load this review.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white">

      {/* Header */}
      <header className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-gray-800">

        {/* Back Button */}
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={15} />
          <span>History</span>
        </button>

        {/* File Info Row */}
        {review && (
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Left: filename + language badge */}
            <div className="flex items-center gap-2 min-w-0">
              <FileCode size={15} className="text-gray-400 flex-shrink-0" />
              <span className="font-mono text-sm font-medium text-white truncate">
                {review.filename}
              </span>
              <span className={`badge rounded-full px-3 py-0.5 text-[11px] flex-shrink-0 ${
                review.language === 'python'
                  ? 'badge-style'
                  : 'badge-security'
              }`}>
                {review.language}
              </span>
            </div>

            {/* Right: date + score ring */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                <Clock size={12} />
                {new Date(review.created_at).toLocaleString()}
              </span>
              <ScoreRing score={review.score} size={48} />
            </div>

          </div>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-5">

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
            Loading review…
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Review Results */}
        {review && <ReviewResults result={review} />}

      </div>
    </div>
  )
}