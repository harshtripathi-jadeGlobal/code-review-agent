import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { LayoutDashboard, TrendingUp, AlertOctagon, Activity } from 'lucide-react'

// Custom styling palette
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981']

export default function StatisticDashboard({ stats, loading, error }) {
  if (loading) return (
    <div className="flex h-full items-center justify-center p-20">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-white/20 animate-spin" />
        <span className="text-sm font-semibold tracking-wider uppercase">Loading stats...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-10 flex flex-col items-center justify-center text-red-400">
      <AlertOctagon size={48} className="mb-4 opacity-50" />
      <span className="font-semibold">{error}</span>
    </div>
  )

  if (!stats) return null

  // ── Compute Chart Data ──

  // 1. Pie Chart: Issues Breakdown by Category
  const pieData = useMemo(() => {
    if (!stats.by_category) return []
    return Object.entries(stats.by_category).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })).sort((a, b) => b.value - a.value)
  }, [stats])

  // 2. Bar Chart: High-Level Platform Overview
  const barData = [
    { name: 'Total Code Reviews', value: stats.total_reviews, fill: '#3b82f6' },
    { name: 'Total Issues Found', value: stats.total_issues, fill: '#ef4444' },
    { name: 'Avg. Quality Score', value: stats.avg_score, fill: '#10b981' },
  ]

  // 3. Clustered Bar Chart: Weekly Trends
  // Prefer real backend data from stats.weekly; fall back to a simulated shape if unavailable.
  const clusteredData = useMemo(() => {
    const makeLabel = (dateStr) => {
      const d = new Date(dateStr)
      if (Number.isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString(undefined, { weekday: 'short' })
    }

    // Prefer real weekly data from backend
    if (stats.weekly && Array.isArray(stats.weekly) && stats.weekly.length > 0) {
      return stats.weekly.map((day) => ({
        name: makeLabel(day.date),
        Critical: day.critical ?? 0,
        Warning: day.warning ?? 0,
        Info: day.info ?? 0,
      }))
    }

    // Fallback: synthetic distribution based on totals
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const total = stats.total_issues || 0
    const critTotal = stats.critical_total || 0
    const warnTotal = stats.warning_total ?? Math.round((total - critTotal) * 0.6)
    const infoTotal = stats.info_total ?? Math.max(0, total - critTotal - warnTotal)

    if (total <= 0) {
      return days.map((name) => ({
        name,
        Critical: 0,
        Warning: 0,
        Info: 0,
      }))
    }

    const critRatio = critTotal / total
    const warnRatio = warnTotal / total
    const infoRatio = infoTotal / total

    return days.map((name, i) => {
      const base = Math.max(2, Math.floor(total / 7) + Math.sin(i) * 5)
      const critical = Math.max(0, Math.round(base * critRatio))
      const warning = Math.max(0, Math.round(base * warnRatio))
      const info = Math.max(0, Math.round(base * infoRatio))
      return {
        name,
        Critical: critical,
        Warning: warning,
        Info: info,
      }
    })
  }, [stats])

  // Custom Tooltips for premium feel
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-white/10 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <p className="text-white font-semibold text-[13px] mb-2 border-b border-white/10 pb-2">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[13px] py-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-gray-400 capitalize">{entry.name}:</span>
              <span className="text-white font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full w-full bg-gray-950 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col h-max px-6 sm:px-12 lg:px-16 py-8 md:py-12 gap-10 min-h-full max-w-[1400px] mx-auto w-full">

        {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <LayoutDashboard className="text-blue-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
            Analytics &amp; Intelligence
          </h1>
          <p className="text-sm font-medium text-gray-500">
            A comprehensive overview of your codebase health and review metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full min-w-0">
        
        {/* 1. PIE CHART: Categories */}
        <div className="bg-gray-900 rounded-3xl border border-white/5 p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden min-w-0">
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-purple-400" size={18} />
            <h2 className="text-lg font-bold text-white">Issues by Category</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Proportional breakdown of all the specific categories of issues flagged by the AI agent across all project reviews.
          </p>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadii={[6, 6, 6, 6]} // Depending on recharts version, cornerRadii is ignored if unavailable
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-gray-400 font-medium text-sm ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. SIMPLE BAR CHART: Platform Overview */}
        <div className="bg-gray-900 rounded-3xl border border-white/5 p-6 lg:p-8 shadow-2xl flex flex-col relative overflow-hidden min-w-0">
          <div className="absolute bottom-0 left-0 p-32 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="text-blue-400" size={18} />
            <h2 className="text-lg font-bold text-white">Platform Overview</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Global high-level performance metrics measuring total productivity volumes versus code quality scoring averages.
          </p>

          <div className="flex-1 w-full min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={5} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. CLUSTERED BAR CHART: Daily Tracking */}
      <div className="bg-gray-900 rounded-3xl border border-white/5 p-6 lg:p-10 shadow-2xl flex flex-col relative overflow-hidden mb-12 min-w-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-64 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-amber-400" size={18} />
          <h2 className="text-lg font-bold text-white">Weekly Security &amp; Bug Tracking</h2>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-medium max-w-3xl">
          A side-by-side clustered representation comparing critical vulnerabilities against minor code issues found over the past week.
        </p>

        <div className="w-full h-[400px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusteredData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} minTickGap={5} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
              <Legend
                verticalAlign="top" 
                height={40} 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px' }}
                formatter={(value) => <span className="text-gray-400 font-medium ml-1">{value}</span>}
              />
              <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Warning" name="Warnings" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Info" name="Info" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      </div>
    </div>
  )
}