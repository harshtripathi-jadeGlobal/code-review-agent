import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Code2, History, Zap, Menu, X } from 'lucide-react'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <div className={styles.logoName}>Codewatch</div>
            <div className={styles.logoSub}>AI Review Agent</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Workspace</span>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <Code2 size={15} />
              <span>Review Code</span>
              <div className={styles.navIndicator} />
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <History size={15} />
              <span>History</span>
              <div className={styles.navIndicator} />
            </NavLink>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>API connected</span>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Main */}
      <main className={styles.main}>
        {children}
      </main>

      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  )
}
