import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { analyticsApi } from '../utils/api'
import SiteSelector from '../components/SiteSelector'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts'
import { Monitor, Smartphone, Tablet, Globe, ExternalLink, RefreshCw, GitCompare } from 'lucide-react'
import clsx from 'clsx'

const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const DAY_OPTIONS = [
  { label: '7D', value: 7 }, { label: '30D', value: 30 }, { label: '90D', value: 90 },
]

const COMPARE_OPTIONS = [
  { label: 'Off', value: null },
  { label: 'Prev. Period', value: 'previous_period' },
  { label: 'Prev. Year', value: 'previous_year' },
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

export default function Analytics() {
  const [site, setSite] = useState(null)
  const [days, setDays] = useState(7)
  const [compare, setCompare] = useState(null)
  const [stats, setStats] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')

  const fetchData = async () => {
    if (!site?.siteKey) return
    setLoading(true)
    try {
      const statsRes = await analyticsApi.getFullStats(site.siteKey, days)
      setStats(statsRes.data)
      if (compare) {
        const cmpRes = await analyticsApi.getComparison(site.siteKey, days, compare)
        setComparison(cmpRes.data)
      } else {
        setComparison(null)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [site, days, compare])

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'pages', label: 'Top Pages' },
    { key: 'referrers', label: 'Referrers' },
    { key: 'devices', label: 'Devices' },
    { key: 'geo', label: 'Geography' },
    { key: 'utm', label: 'UTM / Campaigns' },
    { key: 'compare', label: 'Compare', icon: GitCompare },
  ]

  return (
    <div className="p-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <div className="flex items-center gap-3 flex-wrap">
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

          <button onClick={fetchData} className="btn-secondary p-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900 border border-slate-800 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide -mx-6 px-6 md:mx-0 md:px-1">
        <div className="flex gap-1 min-w-max md:min-w-0 md:flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.key ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
            )}
          >
            {t.icon && <t.icon size={14} />} {t.label}
          </button>
        ))}
        </div>
      </div>

      {!site ? (
        <div className="card text-center py-16">
          <p className="text-slate-400">Select a site to view analytics</p>
        </div>
      ) : loading && !stats ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Traffic Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.timeSeries?.map(p => ({ ...p, date: p.date?.substring(0, 10) })) || []}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="pageViews" name="pageviews" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="visitors" name="visitors" stroke="#10b981" fill="none" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="sessions" name="sessions" stroke="#3b82f6" fill="none" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TOP PAGES TAB */}
          {tab === 'pages' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Top Pages</h2>
              {stats?.topPages?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No page data yet</p>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-4 px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                    <div className="col-span-2">Page</div>
                    <div className="text-right">Views</div>
                    <div className="text-right">Visitors</div>
                  </div>
                  {stats?.topPages?.map((page, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors">
                      <div className="col-span-2 flex items-center gap-2 min-w-0">
                        <span className="text-slate-600 text-xs w-5">{i + 1}</span>
                        <a href={page.url} target="_blank" rel="noopener noreferrer"
                          className="text-slate-300 text-sm truncate hover:text-primary-400 transition-colors flex items-center gap-1">
                          {page.url}
                          <ExternalLink size={10} className="flex-shrink-0 opacity-50" />
                        </a>
                      </div>
                      <div className="text-right text-white font-medium text-sm">{page.views?.toLocaleString()}</div>
                      <div className="text-right text-slate-400 text-sm">{page.uniqueVisitors?.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REFERRERS TAB */}
          {tab === 'referrers' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Referrer Sources</h2>
                {stats?.referrers?.length ? (
                  <div className="space-y-2">
                    {stats.referrers.map((ref, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 truncate">{ref.referrer}</span>
                            <span className="text-white font-medium ml-2">{ref.visits?.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary-600 transition-all"
                              style={{ width: `${ref.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                        <span className="text-slate-500 text-xs w-10 text-right">{ref.percentage?.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No referrer data</p>
                )}
              </div>
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Referrer Distribution</h2>
                {stats?.referrers?.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={stats.referrers.slice(0, 6)} dataKey="visits" nameKey="referrer"
                        cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                        {stats.referrers.slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => v.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-slate-400 text-sm text-center py-8">No data</p>}
              </div>
            </div>
          )}

          {/* DEVICES TAB */}
          {tab === 'devices' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Device Types</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats?.devices || []} dataKey="count" nameKey="type"
                      cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {(stats?.devices || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Browsers</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.browsers || []} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                    <YAxis type="category" dataKey="browser" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="visitors" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* GEO TAB */}
          {tab === 'geo' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Visitors by Country</h2>
              <div className="space-y-2">
                {stats?.countries?.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No geographic data yet</p>
                ) : (
                  stats?.countries?.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs w-5">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{c.country}</span>
                          <span className="text-white font-medium">{c.visitors?.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs w-10 text-right">{c.percentage?.toFixed(1)}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* UTM TAB */}
          {tab === 'utm' && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">UTM Campaign Performance</h2>
              {stats?.utmSources?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No UTM data — start using utm_source, utm_medium, utm_campaign params in your links</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">Source</th>
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">Medium</th>
                        <th className="text-left py-2 px-3 text-slate-500 font-medium">Campaign</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-medium">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.utmSources?.map((u, i) => (
                        <tr key={i} className="border-b border-slate-800/50 hover:bg-dark-800/50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-300">{u.source || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{u.medium || '—'}</td>
                          <td className="py-2.5 px-3 text-slate-400">{u.campaign || '—'}</td>
                          <td className="py-2.5 px-3 text-white font-medium text-right">{u.sessions?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* COMPARE TAB */}
          {tab === 'compare' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Compare to:</span>
                {COMPARE_OPTIONS.map(opt => (
                  <button key={String(opt.value)} onClick={() => setCompare(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      compare === opt.value ? 'bg-primary-600 text-white' : 'btn-secondary'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              {comparison ? (
                <div className="card">
                  <h2 className="font-semibold text-white mb-4">Period Comparison</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line data={comparison.current?.map(p => ({ ...p, date: p.date?.substring(0, 10) }))}
                        type="monotone" dataKey="pageViews" name="Current Period" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line data={comparison.previous?.map(p => ({ ...p, date: p.date?.substring(0, 10) }))}
                        type="monotone" dataKey="pageViews" name="Previous Period" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    {[
                      { label: 'Page Views', curr: comparison.currentSummary?.totalPageViews, prev: comparison.previousSummary?.totalPageViews },
                      { label: 'Visitors', curr: comparison.currentSummary?.uniqueVisitors, prev: comparison.previousSummary?.uniqueVisitors },
                      { label: 'Sessions', curr: comparison.currentSummary?.totalSessions, prev: comparison.previousSummary?.totalSessions },
                    ].map(({ label, curr, prev }) => {
                      const change = prev > 0 ? ((curr - prev) * 100 / prev) : 0
                      return (
                        <div key={label} className="bg-dark-800 rounded-lg p-4">
                          <p className="text-slate-400 text-xs mb-2">{label}</p>
                          <p className="text-white font-bold text-xl">{curr?.toLocaleString()}</p>
                          <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs prev
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12 text-slate-400 text-sm">
                  Select a comparison period above
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
