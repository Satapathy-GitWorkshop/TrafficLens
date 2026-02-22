import { useState, useEffect } from 'react'
import { analyticsApi } from '../utils/api'
import { Globe, Plus, Trash2, Copy, CheckCheck, Code, X } from 'lucide-react'

export default function Settings() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newSite, setNewSite] = useState({ name: '', domain: '' })
  const [adding, setAdding] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    analyticsApi.getSites().then(res => { setSites(res.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await analyticsApi.createSite(newSite)
      setSites(prev => [...prev, res.data])
      setShowAdd(false)
      setNewSite({ name: '', domain: '' })
    } catch {}
    setAdding(false)
  }

  const handleDelete = async (siteId) => {
    await analyticsApi.deleteSite(siteId)
    setSites(prev => prev.filter(s => s.id !== siteId))
    setDeleteId(null)
    if (selectedSite?.id === siteId) setSelectedSite(null)
  }

  const getSnippet = (site) => `<!-- TrafficLens Analytics -->
<script>
  window.TrafficLens = {
    siteKey: "${site.siteKey}",
    apiUrl: "${window.location.origin}"
  };
  var s = document.createElement('script');
  s.src = '/tracker.js';
  s.async = true;
  document.head.appendChild(s);
</script>`

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your tracked websites</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Site
        </button>
      </div>

      {/* Add site modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-white">Add New Site</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Site Name</label>
                <input className="input" placeholder="My Awesome Website" value={newSite.name}
                  onChange={e => setNewSite({ ...newSite, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Domain</label>
                <input className="input" placeholder="example.com" value={newSite.domain}
                  onChange={e => setNewSite({ ...newSite, domain: e.target.value })} required />
                <p className="text-slate-600 text-xs mt-1">Without https:// or www</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={adding} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {adding && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {adding ? 'Adding...' : 'Add Site'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="bg-dark-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm animate-fade-in">
            <h2 className="font-display text-xl font-bold text-white mb-2">Delete Site?</h2>
            <p className="text-slate-400 text-sm mb-5">This will delete all tracking data for this site. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2 font-medium text-sm transition-colors">
                Delete Forever
              </button>
              <button onClick={() => setDeleteId(null)} className="btn-secondary px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sites.length === 0 ? (
        <div className="card text-center py-16">
          <Globe size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No sites added yet</h3>
          <p className="text-slate-400 text-sm mb-4">Add your first website to start tracking</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add Site
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map(site => (
            <div key={site.id} className="card border-slate-700">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                    <Globe size={18} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{site.name}</h3>
                    <p className="text-slate-400 text-sm">{site.domain}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSite(selectedSite?.id === site.id ? null : site)}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
                  >
                    <Code size={13} />
                    {selectedSite?.id === site.id ? 'Hide' : 'Get Snippet'}
                  </button>
                  <button onClick={() => setDeleteId(site.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Site Key */}
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2 mb-3">
                <span className="text-slate-500 text-xs">Site Key:</span>
                <code className="text-primary-400 text-xs font-mono flex-1">{site.siteKey}</code>
                <button onClick={() => copy(site.siteKey, site.id + '-key')}
                  className="text-slate-500 hover:text-slate-300 transition-colors">
                  {copiedKey === site.id + '-key' ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Snippet */}
              {selectedSite?.id === site.id && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-400 font-medium">
                      Add this snippet before <code className="text-primary-400">&lt;/head&gt;</code> on your site:
                    </p>
                    <button onClick={() => copy(getSnippet(site), site.id + '-snippet')}
                      className="btn-secondary text-xs flex items-center gap-1.5 py-1.5">
                      {copiedKey === site.id + '-snippet' ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedKey === site.id + '-snippet' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-dark-950 border border-slate-800 rounded-lg p-4 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                    {getSnippet(site)}
                  </pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-slate-500 text-xs w-full">Works with:</p>
                    {['React', 'Vue', 'Next.js', 'WordPress', 'Shopify', 'Plain HTML', 'PHP', 'Laravel', 'Angular'].map(fw => (
                      <span key={fw} className="badge badge-blue">{fw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
