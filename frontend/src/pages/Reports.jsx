import { useState, useEffect } from 'react'
import { reportsApi } from '../utils/api'
import SiteSelector from '../components/SiteSelector'
import { FileText, Download, Trash2, Plus, Clock, CheckCircle, XCircle, Loader } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_ICONS = {
  PENDING: <Clock size={14} className="text-yellow-400" />,
  PROCESSING: <Loader size={14} className="text-blue-400 animate-spin" />,
  READY: <CheckCircle size={14} className="text-emerald-400" />,
  FAILED: <XCircle size={14} className="text-red-400" />,
}

const REPORT_TYPES = [
  { value: 'full', label: 'Full Report' },
  { value: 'overview', label: 'Overview Only' },
  { value: 'pages', label: 'Top Pages' },
  { value: 'referrers', label: 'Referrers' },
  { value: 'devices', label: 'Devices & Browsers' },
]

export default function Reports() {
  const [site, setSite] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '',
    reportType: 'full',
    dateFrom: format(new Date(Date.now() - 7 * 864e5), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd')
  })
  const [creating, setCreating] = useState(false)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await reportsApi.getReports()
      setReports(res.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchReports() }, [])

  // Auto refresh pending reports
  useEffect(() => {
    const hasPending = reports.some(r => r.status === 'PENDING' || r.status === 'PROCESSING')
    if (!hasPending) return
    const timer = setInterval(fetchReports, 3000)
    return () => clearInterval(timer)
  }, [reports])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!site?.siteKey) return alert('Please select a site')
    setCreating(true)
    try {
      await reportsApi.createReport({ ...form, siteKey: site.siteKey })
      setShowCreate(false)
      setForm({ ...form, name: '' })
      fetchReports()
    } catch {}
    setCreating(false)
  }

  const handleDownload = async (report) => {
    try {
      const res = await reportsApi.downloadReport(report.id)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `${report.name}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return
    await reportsApi.deleteReport(id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Reports</h1>
        <div className="flex items-center gap-3">
          <SiteSelector selected={site} onSelect={setSite} />
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Report
          </button>
        </div>
      </div>

      {/* Create report modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="font-display text-xl font-bold text-white mb-5">Create New Report</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Report Name</label>
                <input className="input" placeholder="e.g. Weekly Traffic Report" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Report Type</label>
                <select className="input" value={form.reportType}
                  onChange={e => setForm({ ...form, reportType: e.target.value })}>
                  {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">From</label>
                  <input type="date" className="input" value={form.dateFrom}
                    onChange={e => setForm({ ...form, dateFrom: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">To</label>
                  <input type="date" className="input" value={form.dateTo}
                    onChange={e => setForm({ ...form, dateTo: e.target.value })} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {creating ? 'Creating...' : 'Generate Report'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports list */}
      {loading && reports.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No reports yet</h3>
          <p className="text-slate-400 text-sm mb-4">Generate your first analytics report</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Report
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-1">
            {reports.map(report => (
              <div key={report.id}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl hover:bg-dark-800 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-dark-800 group-hover:bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium text-sm truncate">{report.name}</p>
                    <p className="text-slate-500 text-xs">
                      {report.siteKey} · {report.dateFrom} to {report.dateTo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {STATUS_ICONS[report.status]}
                    <span className={
                      report.status === 'READY' ? 'text-emerald-400' :
                      report.status === 'FAILED' ? 'text-red-400' :
                      report.status === 'PROCESSING' ? 'text-blue-400' : 'text-yellow-400'
                    }>{report.status}</span>
                  </div>

                  <p className="text-slate-600 text-xs hidden md:block">
                    {format(new Date(report.createdAt), 'MMM d, HH:mm')}
                  </p>

                  {report.status === 'READY' && (
                    <button onClick={() => handleDownload(report)}
                      className="btn-secondary p-2 text-slate-400 hover:text-emerald-400">
                      <Download size={14} />
                    </button>
                  )}

                  <button onClick={() => handleDelete(report.id)}
                    className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
