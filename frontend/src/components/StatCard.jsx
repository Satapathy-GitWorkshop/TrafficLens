import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

export default function StatCard({ title, value, change, icon: Icon, color = 'primary', loading }) {
  const isPositive = change > 0
  const isNeutral = change === 0 || change === undefined || change === null

  const colorMap = {
    primary: 'bg-primary-600/20 text-primary-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    blue: 'bg-blue-600/20 text-blue-400',
    orange: 'bg-orange-600/20 text-orange-400',
    purple: 'bg-purple-600/20 text-purple-400',
  }

  if (loading) return (
    <div className="stat-card animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
      <div className="h-8 bg-slate-700 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-700 rounded w-16" />
    </div>
  )

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[color])}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <p className="font-display text-2xl font-bold text-white mb-1">{value ?? '—'}</p>

      {!isNeutral && (
        <div className={clsx('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-400' : 'text-red-400')}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change).toFixed(1)}% vs previous period
        </div>
      )}
      {isNeutral && change !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <Minus size={12} /> No change
        </div>
      )}
    </div>
  )
}
