import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../utils/api'
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileMsg, setProfileMsg] = useState(null)
  const [pwMsg, setPwMsg] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setLoadingProfile(true); setProfileMsg(null)
    try {
      const res = await authApi.updateProfile(profileForm)
      updateUser(res.data)
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    }
    setLoadingProfile(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwMsg({ type: 'error', text: 'New passwords do not match' })
    }
    setLoadingPw(true); setPwMsg(null)
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwMsg({ type: 'success', text: 'Password changed successfully!' })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    }
    setLoadingPw(false)
  }

  const Message = ({ msg }) => msg ? (
    <div className={`flex items-center gap-2 rounded-lg p-3 text-sm mt-3 ${
      msg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
      'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
      {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {msg.text}
    </div>
  ) : null

  return (
    <div className="p-6 animate-slide-up">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Profile</h1>

      <div className="max-w-2xl space-y-6">
        {/* Avatar + name */}
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg">{user?.fullName}</h2>
            <p className="text-slate-400">{user?.email}</p>
            <span className="badge badge-blue mt-1">{user?.role}</span>
          </div>
        </div>

        {/* Update profile */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">Personal Information</h2>
          </div>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
              <input className="input" value={profileForm.fullName}
                onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
              <p className="text-slate-600 text-xs mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={loadingProfile} className="btn-primary flex items-center gap-2">
              {loadingProfile && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loadingProfile ? 'Saving...' : 'Save Changes'}
            </button>
            <Message msg={profileMsg} />
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={18} className="text-primary-400" />
            <h2 className="font-semibold text-white">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Current Password</label>
              <input type="password" className="input" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">New Password</label>
              <input type="password" className="input" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Confirm New Password</label>
              <input type="password" className="input" value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" disabled={loadingPw} className="btn-primary flex items-center gap-2">
              {loadingPw && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loadingPw ? 'Changing...' : 'Change Password'}
            </button>
            <Message msg={pwMsg} />
          </form>
        </div>
      </div>
    </div>
  )
}
