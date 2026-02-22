import { useState, useEffect, useRef } from 'react'
import { analyticsApi } from '../utils/api'
import SiteSelector from '../components/SiteSelector'
import { Activity, Users, Globe, Monitor, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function Realtime() {
  const [site, setSite] = useState(null)
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const intervalRef = useRef(null)

  const fetch = async () => {
    if (!site?.siteKey) return
    try {
      const res = await analyticsApi.getRealTime(site.siteKey)
      setData(res.data)
      setHistory(prev => {
        const next = [...prev, { time: format(new Date(), 'HH:mm:ss'), active: res.data.activeNow }]
        return next.slice(-30) // keep last 30 data points
      })
    } catch {}
  }

  useEffect(() => {
    setHistory([])
    setData(null)
    if (site) {
      fetch()
      intervalRef.current = setInterval(fetch, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [site])

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-400 rounded-full live-dot inline-block" />
            Real-time
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Updates every 5 seconds</p>
        </div>
        <SiteSelector selected={site} onSelect={setSite} />
      </div>

      {!site ? (
        <div className="card text-center py-16 text-slate-400">Select a site to view real-time data</div>
      ) : (
        <div className="space-y-6">
          {/* Active now */}
          <div className="card border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Active visitors right now</p>
                <p className="font-display text-5xl font-bold text-white">
                  {data?.activeNow ?? '—'}
                </p>
                <p className="text-slate-500 text-xs mt-1">In the last 5 minutes</p>
              </div>
            </div>
          </div>

          {/* Sparkline of active users */}
          {history.length > 1 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                Active Visitors Trend
              </h3>
              <div className="flex items-end gap-1 h-20">
                {history.map((h, i) => {
                  const max = Math.max(...history.map(x => x.active), 1)
                  const pct = (h.active / max) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500/60 rounded-sm transition-all duration-500 min-h-[2px]"
                        style={{ height: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>{history[0]?.time}</span>
                <span>{history[history.length - 1]?.time}</span>
              </div>
            </div>
          )}

          {/* Active pages */}
          {data?.activePages?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor size={16} className="text-primary-400" />
                Active Pages
              </h3>
              <div className="space-y-2">
                {data.activePages.map((page, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-dark-800 rounded-lg">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 live-dot" />
                    <span className="text-slate-300 text-sm truncate flex-1">{page}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent events */}
          {data?.recentEvents?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                Recent Events
              </h3>
              <div className="space-y-1">
                <div className="grid grid-cols-4 gap-4 px-3 py-1 text-xs text-slate-500 font-medium uppercase">
                  <div className="col-span-2">Page</div>
                  <div>Country</div>
                  <div>Device</div>
                </div>
                {data.recentEvents.map((e, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 px-3 py-2 rounded-lg hover:bg-dark-800 transition-colors animate-fade-in">
                    <div className="col-span-2 text-slate-300 text-sm truncate">{e.url}</div>
                    <div className="text-slate-400 text-sm">{e.country}</div>
                    <div className="text-slate-400 text-sm capitalize">{e.device}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data && !data.activeNow && (
            <div className="card text-center py-10">
              <Activity size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No active visitors right now</p>
              <p className="text-slate-600 text-sm mt-1">This refreshes every 5 seconds</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
