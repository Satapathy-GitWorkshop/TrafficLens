import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('tl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 - redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tl_token')
      localStorage.removeItem('tl_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsApi = {
  getSites: () => api.get('/analytics/sites'),
  createSite: (data) => api.post('/analytics/sites', data),
  deleteSite: (siteId) => api.delete(`/analytics/sites/${siteId}`),

  getOverview: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/overview?days=${days}`),
  getFullStats: (siteKey, days = 7, granularity = 'day') =>
    api.get(`/analytics/${siteKey}/stats?days=${days}&granularity=${granularity}`),
  getTimeSeries: (siteKey, days = 7, granularity = 'day') =>
    api.get(`/analytics/${siteKey}/timeseries?days=${days}&granularity=${granularity}`),
  getTopPages: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/pages?days=${days}`),
  getReferrers: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/referrers?days=${days}`),
  getDevices: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/devices?days=${days}`),
  getBrowsers: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/browsers?days=${days}`),
  getCountries: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/countries?days=${days}`),
  getUtm: (siteKey, days = 7) => api.get(`/analytics/${siteKey}/utm?days=${days}`),
  getRealTime: (siteKey) => api.get(`/analytics/${siteKey}/realtime`),
  getComparison: (siteKey, days = 7, compareTo = 'previous_period') =>
    api.get(`/analytics/${siteKey}/compare?days=${days}&compareTo=${compareTo}`),
}

// ─── Reports ────────────────────────────────────────────────────────────────
export const reportsApi = {
  getReports: () => api.get('/reports'),
  createReport: (data) => api.post('/reports', data),
  downloadReport: (reportId) => api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  deleteReport: (reportId) => api.delete(`/reports/${reportId}`),
}
