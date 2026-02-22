import { useState, useEffect } from 'react'
import { analyticsApi } from '../utils/api'
import StatCard from '../components/StatCard'
import SiteSelector from '../components/SiteSelector'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Users, Eye, MousePointer, Clock, BarChart2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

const DAY_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-slate-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="font-medium text-white">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [site, setSite] = useState(null)
  const [days, setDays] = useState(7)
  const [overview, setOverview] = useState(null)
  const [timeSeries, setTimeSeries] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = async () => {
    if (!site?.siteKey) return
    setLoading(true)
    try {
      const [ovRes, tsRes] = await Promise.all([
        analyticsApi.getOverview(site.siteKey, days),
        analyticsApi.getTimeSeries(site.siteKey, days, days <= 7 ? 'day' : 'day')
      ])
      setOverview(ovRes.data)
      setTimeSeries(tsRes.data.map(p => ({
        ...p,
        date: p.date ? p.date.substring(0, 10) : ''
      })))
      setLastUpdated(new Date())
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [site, days])

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n?.toString() || '0'

  return (
    <div className="p-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
            {lastUpdated && (
              <p className="text-slate-500 text-sm mt-0.5">Updated {format(lastUpdated, 'HH:mm:ss')}</p>
            )}
          </div>
          <button onClick={fetchData} className="btn-secondary p-2 md:hidden" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SiteSelector selected={site} onSelect={setSite} />
          <div className="flex items-center bg-dark-800 border border-slate-700 rounded-lg p-1 gap-1">
            {DAY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDays(opt.value)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  days === opt.value ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="btn-secondary p-2 hidden md:flex" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {!site ? (
        <div className="card text-center py-16">
          <BarChart2 size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No site selected</h3>
          <p className="text-slate-400 text-sm">Select or add a site to view analytics</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Page Views" value={fmt(overview?.totalPageViews)} change={overview?.pageViewsChange}
              icon={Eye} color="primary" loading={loading && !overview} />
            <StatCard title="Unique Visitors" value={fmt(overview?.uniqueVisitors)} change={overview?.visitorsChange}
              icon={Users} color="emerald" loading={loading && !overview} />
            <StatCard title="Sessions" value={fmt(overview?.totalSessions)} change={overview?.sessionsChange}
              icon={MousePointer} color="blue" loading={loading && !overview} />
            <StatCard title="Active Now" value={overview?.activeNow?.toString()}
              icon={Clock} color="orange" loading={loading && !overview} />
          </div>

          {/* Time series chart */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">Traffic Over Time</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                <span className="text-slate-400 text-xs">Page Views</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" />
                <span className="text-slate-400 text-xs">Visitors</span>
              </div>
            </div>

            {loading && timeSeries.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : timeSeries.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                No data available for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={timeSeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="pageViews" name="pageviews" stroke="#6366f1" strokeWidth={2}
                    fill="url(#gPageViews)" dot={false} />
                  <Area type="monotone" dataKey="visitors" name="visitors" stroke="#10b981" strokeWidth={2}
                    fill="url(#gVisitors)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick metrics */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="font-semibold text-white mb-3">Bounce Rate</h3>
                <p className="font-display text-3xl font-bold text-white mb-1">
                  {overview.bounceRate?.toFixed(1)}%
                </p>
                <div className="w-full bg-dark-800 rounded-full h-2 mt-3">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(overview.bounceRate, 100)}%` }}
                  />
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-white mb-3">Avg. Session Duration</h3>
                <p className="font-display text-3xl font-bold text-white mb-1">
                  {Math.floor((overview.avgSessionDuration || 0) / 60)}m{' '}
                  {Math.round((overview.avgSessionDuration || 0) % 60)}s
                </p>
                <p className="text-slate-500 text-sm mt-3">Average time users spend on your site</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
