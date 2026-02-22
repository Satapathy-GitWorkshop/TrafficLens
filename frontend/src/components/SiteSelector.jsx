import { useState, useEffect } from 'react'
import { analyticsApi } from '../utils/api'
import { Globe, ChevronDown, Plus, X } from 'lucide-react'

export default function SiteSelector({ selected, onSelect, showAddNew = true }) {
  const [sites, setSites] = useState([])
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newSite, setNewSite] = useState({ name: '', domain: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    analyticsApi.getSites().then(res => {
      setSites(res.data)
      if (!selected && res.data.length > 0) onSelect(res.data[0])
    }).catch(() => {})
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await analyticsApi.createSite(newSite)
      setSites(prev => [...prev, res.data])
      onSelect(res.data)
      setAdding(false)
      setNewSite({ name: '', domain: '' })
    } catch {}
    setLoading(false)
  }

  const currentSite = sites.find(s => s.siteKey === selected?.siteKey)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-dark-800 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        <Globe size={14} className="text-primary-400" />
        <span className="text-slate-200 font-medium max-w-32 truncate">
          {currentSite?.name || 'Select site'}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-dark-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
          {sites.length === 0 && !adding && (
            <div className="px-4 py-3 text-slate-400 text-sm">No sites yet</div>
          )}
          {sites.map(site => (
            <button
              key={site.siteKey}
              onClick={() => { onSelect(site); setOpen(false) }}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-dark-700 transition-colors text-left ${
                site.siteKey === selected?.siteKey ? 'bg-primary-600/10 border-l-2 border-primary-500' : ''}`}
            >
              <Globe size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{site.name}</p>
                <p className="text-slate-500 text-xs truncate">{site.domain}</p>
              </div>
            </button>
          ))}

          {adding ? (
            <form onSubmit={handleAdd} className="p-3 border-t border-slate-700 space-y-2">
              <input className="input text-sm py-1.5" placeholder="Site name" value={newSite.name}
                onChange={e => setNewSite({ ...newSite, name: e.target.value })} required />
              <input className="input text-sm py-1.5" placeholder="example.com" value={newSite.domain}
                onChange={e => setNewSite({ ...newSite, domain: e.target.value })} required />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn-primary text-xs px-3 py-1.5 flex-1">
                  {loading ? '...' : 'Add Site'}
                </button>
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary text-xs px-3 py-1.5">
                  <X size={12} />
                </button>
              </div>
            </form>
          ) : showAddNew && (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-primary-400 hover:bg-dark-700 border-t border-slate-700 text-sm transition-colors"
            >
              <Plus size={14} /> Add new site
            </button>
          )}
        </div>
      )}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
