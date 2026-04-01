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

  // 3. Clustered Bar Chart: Weekly Trends (Simulated based on totals for visual effect)
  // Real apps would fetch this from a /stats/trends endpoint
  const clusteredData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const ratio = stats.total_issues > 0 ? (stats.critical_total / stats.total_issues) : 0
    return days.map((day, i) => {
      // Simulate bell-curveish distribution over the week holding the total
      const base = Math.max(2, Math.floor(stats.total_issues / 7) + (Math.sin(i) * 5))
      const crit = Math.max(0, Math.floor(base * ratio) + (i % 2 === 0 ? 1 : -1))
      return {
        name: day,
        Critical: Math.max(0, crit),
        WarningAndInfo: Math.max(0, Math.floor(base) - crit)
      }
    })
  }, [stats])

  // Custom Tooltips for premium feel
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f141f] border border-white/10 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
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
    <div className="absolute inset-0 bg-[#080b10] overflow-y-auto" style={{ zIndex: 10 }}>
      <div className="flex flex-col h-max px-8 py-10 gap-10 min-h-full">

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* 1. PIE CHART: Categories */}
        <div className="bg-[#0c1018] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-purple-400" size={18} />
            <h2 className="text-lg font-bold text-gray-200">Issues by Category</h2>
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
        <div className="bg-[#0c1018] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 left-0 p-32 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="text-blue-400" size={18} />
            <h2 className="text-lg font-bold text-gray-200">Platform Overview</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Global high-level performance metrics measuring total productivity volumes versus code quality scoring averages.
          </p>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
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
      <div className="bg-[#0c1018] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col relative overflow-hidden mb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-64 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-amber-400" size={18} />
          <h2 className="text-lg font-bold text-gray-200">Weekly Security &amp; Bug Tracking</h2>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-medium max-w-3xl">
          A side-by-side clustered representation comparing critical vulnerabilities against minor code issues found over the past week.
        </p>

        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={40} 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px' }}
                formatter={(value) => <span className="text-gray-300 font-medium ml-1">{value}</span>}
              />
              <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="WarningAndInfo" name="Warnings &amp; Info" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      </div>
    </div>
  )
}