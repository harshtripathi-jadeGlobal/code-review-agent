import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReviewResults from '../components/ReviewResults'
import ScoreRing from '../components/ScoreRing'
import styles from './ReviewDetailPage.module.css'
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
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/history')}>
          <ArrowLeft size={15} />
          <span>History</span>
        </button>

        {review && (
          <div className={styles.headerInfo}>
            <div className={styles.fileRow}>
              <FileCode size={15} color="var(--text-muted)" />
              <span className={styles.filename}>{review.filename}</span>
              <span className={`badge badge-${review.language === 'python' ? 'style' : 'performance'}`}>
                {review.language}
              </span>
            </div>
            <div className={styles.headerRight}>
              <span className={styles.date}>
                <Clock size={12} />
                {new Date(review.created_at).toLocaleString()}
              </span>
              <ScoreRing score={review.score} size={48} />
            </div>
          </div>
        )}
      </header>

      <div className={styles.body}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Loading review…
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
        {review && (
          <ReviewResults result={review} />
        )}
      </div>
    </div>
  )
}
