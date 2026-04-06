import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ScoreRing from '../components/ScoreRing'
import { Clock, FileCode, ChevronRight, BarChart3, AlertTriangle, TrendingUp, Shield } from 'lucide-react'

// ✅ NEW: Exact time formatter (IST)
function formatTime(iso) {
  if (!iso) return ""

  // ensure UTC parsing
  const date = new Date(iso.endsWith("Z") ? iso : iso + "Z")
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

export default function HistoryPage({ stats, history, loading, error }) {



  const navigate = useNavigate()

  return (
    <div className="h-full w-full bg-gray-950 overflow-y-auto overflow-x-hidden text-white flex flex-col">
      <div 
        className="mx-auto max-w-[1400px] w-full py-10 md:py-16 flex flex-col gap-10"
        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
      >

        {/* Header Block */}
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Review History</h1>
          <p className="text-gray-400 text-sm font-medium">All past code submissions and intelligent analysis results.</p>
        </div>

        {/* Stats Row Container */}
        {stats && (
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full">
              
              <div 
                className="flex flex-col justify-center items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-sm transition-all hover:border-gray-700"
                style={{ padding: '1.75rem' }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg shadow-inner shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-3xl font-black text-white leading-none tracking-tight">{stats.total_reviews}</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">{stats.total_reviews === 1 ? 'Review' : 'Total Reviews'}</span>
                </div>
              </div>

              <div 
                className="flex flex-col justify-center items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-sm transition-all hover:border-gray-700"
                style={{ padding: '1.75rem' }}
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-inner shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-3xl font-black text-white leading-none tracking-tight">{stats.total_issues}</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">Issues Found</span>
                </div>
              </div>

              <div 
                className="flex flex-col justify-center items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-sm transition-all hover:border-gray-700"
                style={{ padding: '1.75rem' }}
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-inner shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-3xl font-black text-white leading-none tracking-tight">{stats.avg_score}</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">Avg Score</span>
                </div>
              </div>

              <div 
                className="flex flex-col justify-center items-start gap-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-sm transition-all hover:border-gray-700"
                style={{ padding: '1.75rem' }}
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-3xl font-black text-white leading-none tracking-tight">{stats.critical_total}</span>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">{stats.critical_total === 1 ? 'Critical Flaw' : 'Critical Flaws'}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="w-full h-px bg-white/5 rounded-full" />

        {/* Content Block */}
        <div className="w-full flex-1">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400 w-full bg-gray-900/40 rounded-3xl border border-dashed border-gray-800">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm font-medium tracking-wide">Loading history…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-6 text-sm flex items-center gap-3">
              <AlertTriangle size={18} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && history.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-500 w-full bg-gray-900/40 rounded-3xl border border-dashed border-gray-800">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 shadow-inner">
                 <Clock size={24} className="text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold text-lg">No reviews yet</h3>
                <p className="text-sm mt-1 text-gray-500">Run your first code review to see results here.</p>
              </div>
            </div>
          )}

          {/* History List */}
          {!loading && history.length > 0 && (
            <div className="flex flex-col gap-5 w-full pb-10">
              {history.map((item, i) => (
                <button
                  key={item.review_id}
                  onClick={() => navigate(`/history/${item.review_id}`)}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  className="group w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700/80 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 p-5 md:px-6 md:py-5 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between transition-all duration-200 text-left cursor-pointer"
                >
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-gray-400 shadow-inner group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                      <FileCode size={18} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="text-base font-bold text-white tracking-wide">{item.filename}</div>
                      <div className="flex items-center gap-2">
                        <span className={`badge rounded-md px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest ${
                          item.language === 'python' ? 'badge-style' : 'badge-security'
                        }`}>
                          {item.language}
                        </span>

                        <div className="w-1 h-1 rounded-full bg-gray-700" />

                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Clock size={12} />
                          {formatTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-gray-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.critical_count > 0 && (
                        <span className="badge badge-critical rounded-md px-2.5 py-1 text-[10px] font-bold">
                          {item.critical_count} CRITICAL
                        </span>
                      )}
                      {item.warning_count > 0 && (
                        <span className="badge badge-warning rounded-md px-2.5 py-1 text-[10px] font-bold">
                          {item.warning_count} WARNING
                        </span>
                      )}
                      {item.info_count > 0 && (
                        <span className="badge badge-info rounded-md px-2.5 py-1 text-[10px] font-bold">
                          {item.info_count} INFO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pl-2 md:border-l border-gray-800 md:pl-6">
                      <ScoreRing score={item.score} size={42} />
                      <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}