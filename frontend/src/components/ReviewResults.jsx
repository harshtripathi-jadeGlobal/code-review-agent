import React, { useState } from 'react'
import ScoreRing from './ScoreRing'
import IssueCard from './IssueCard'
import styles from './ReviewResults.module.css'
import { ShieldAlert, Bug, Zap, Palette, CheckCircle2 } from 'lucide-react'

const CATEGORIES = ['all', 'bug', 'security', 'performance', 'style']
const SEVERITIES  = ['all', 'critical', 'warning', 'info']

const catIcon = {
  bug:         <Bug size={13} />,
  security:    <ShieldAlert size={13} />,
  performance: <Zap size={13} />,
  style:       <Palette size={13} />,
}

export default function ReviewResults({ result }) {
  const [catFilter, setCatFilter]  = useState('all')
  const [sevFilter, setSevFilter]  = useState('all')
  const [expanded,  setExpanded]   = useState(null)

  const { issues = [], score, summary, critical_count, warning_count, info_count, language } = result

  const filtered = issues.filter(iss => {
    const catOk = catFilter === 'all' || iss.category === catFilter
    const sevOk = sevFilter === 'all' || iss.severity === sevFilter
    return catOk && sevOk
  })

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className={styles.results}>
      {/* Summary bar */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryTop}>
          <div className={styles.summaryMeta}>
            <span className={`badge badge-${language === 'python' ? 'style' : 'performance'}`}>
              {language}
            </span>
            <span className={styles.issueTotal}>{issues.length} issues found</span>
          </div>
          <ScoreRing score={score} size={52} />
        </div>

        <div className={styles.counters}>
          <div className={`${styles.counter} ${styles.counterCritical}`}>
            <span className={styles.counterNum}>{critical_count}</span>
            <span className={styles.counterLabel}>Critical</span>
          </div>
          <div className={`${styles.counter} ${styles.counterWarning}`}>
            <span className={styles.counterNum}>{warning_count}</span>
            <span className={styles.counterLabel}>Warning</span>
          </div>
          <div className={`${styles.counter} ${styles.counterInfo}`}>
            <span className={styles.counterNum}>{info_count}</span>
            <span className={styles.counterLabel}>Info</span>
          </div>
        </div>

        {summary && (
          <p className={styles.summary}>{summary}</p>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.filterChip} ${catFilter === c ? styles.active : ''}`}
              onClick={() => setCatFilter(c)}
            >
              {c !== 'all' && catIcon[c]}
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          {SEVERITIES.map(s => (
            <button
              key={s}
              className={`${styles.filterChip} ${styles[`chip_${s}`]} ${sevFilter === s ? styles.active : ''}`}
              onClick={() => setSevFilter(s)}
            >
              {s === 'all' ? 'All severity' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Issue list */}
      {filtered.length === 0 ? (
        <div className={styles.noIssues}>
          <CheckCircle2 size={20} color="var(--success)" />
          <span>No issues match the current filters</span>
        </div>
      ) : (
        <div className={styles.issueList}>
          {filtered.map((issue, idx) => (
            <IssueCard
              key={issue.id ?? idx}
              issue={issue}
              index={idx}
              expanded={expanded === (issue.id ?? idx)}
              onToggle={() => toggle(issue.id ?? idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
