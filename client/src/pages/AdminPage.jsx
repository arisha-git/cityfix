import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getIssues, updateStatus } from '../services/api'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiClock, FiArrowUp, FiTrash2,
  FiArrowRight, FiUsers, FiAlertCircle,
  FiCheckCircle, FiFilter, FiSearch
} from 'react-icons/fi'

const statusColors = {
  open:          { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:      { bg: '#f0fff4', color: '#38a169' },
}

const categoryColors = {
  roads:       { bg: '#fff7ed', color: '#c2410c' },
  electricity: { bg: '#fefce8', color: '#a16207' },
  water:       { bg: '#eff6ff', color: '#1d4ed8' },
  sanitation:  { bg: '#f0fdf4', color: '#15803d' },
  parks:       { bg: '#f0fdfa', color: '#0f766e' },
  other:       { bg: '#F0FDF9', color: '#0D9488' },
}

const statusLabels = {
  open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved'
}

const tabs = ['issues', 'users']

export default function AdminPage() {
  const [activeTab, setActiveTab]   = useState('issues')
  const [issues, setIssues]         = useState([])
  const [users, setUsers]           = useState([])
  const [officials, setOfficials]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [deleting, setDeleting]     = useState(null)
  const [assigning, setAssigning]   = useState(null)

  useEffect(() => {
    Promise.all([
      getIssues(),
      api.get('/auth/users'),
    ])
      .then(([issuesRes, usersRes]) => {
        setIssues(issuesRes.data)
        setUsers(usersRes.data)
        setOfficials(usersRes.data.filter(u => u.role === 'official'))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this issue?')) return
    setDeleting(id)
    try {
      await api.delete(`/issues/${id}`)
      setIssues(issues.filter(i => i._id !== id))
      toast.success('Issue deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const handleAssign = async (issueId, officialId) => {
    setAssigning(issueId)
    try {
      await api.patch(`/issues/${issueId}`, { assignedTo: officialId })
      toast.success('Issue assigned')
      const res = await getIssues()
      setIssues(res.data)
    } catch {
      toast.error('Failed to assign')
    } finally {
      setAssigning(null)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/auth/users/${userId}`, { role })
      setUsers(users.map(u => u._id === userId ? { ...u, role } : u))
      setOfficials(users.filter(u => u.role === 'official'))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const filteredIssues = issues.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || i.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total:    issues.length,
    open:     issues.filter(i => i.status === 'open').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    users:    users.length,
  }

  const selectStyle = {
    background: '#F0FDF9',
    border: '1px solid #CCFBF1',
    borderRadius: '10px',
    padding: '6px 28px 6px 10px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  }

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: '#CCFBF1', color: '#0D9488' }}>
            ⚙️ Admin Panel
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-400">Manage all issues and users across CityFix</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total issues', value: stats.total,    color: '#0D9488', icon: FiAlertCircle },
            { label: 'Open',         value: stats.open,     color: '#e53e3e', icon: FiAlertCircle },
            { label: 'Resolved',     value: stats.resolved, color: '#38a169', icon: FiCheckCircle },
            { label: 'Total users',  value: stats.users,    color: '#8b5cf6', icon: FiUsers       },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid #CCFBF1' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400">{label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: color + '15' }}>
                  <Icon size={14} style={{ color }}/>
                </div>
              </div>
              <p className="text-4xl font-black" style={{ color }}>
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                background: activeTab === tab ? '#0D9488' : 'white',
                color: activeTab === tab ? 'white' : '#6b7280',
                border: '1px solid #CCFBF1',
              }}>
              {tab === 'issues' ? `🗂️ Issues (${issues.length})` : `👥 Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* Issues tab */}
        {activeTab === 'issues' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-center"
              style={{ border: '1px solid #CCFBF1' }}>
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={15} style={{ color: '#9ca3af' }}/>
                <input type="text" placeholder="Search issues..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
                  style={{ background: '#F0FDF9', border: '2px solid #CCFBF1', color: '#374151' }}
                  onFocus={e => e.target.style.borderColor = '#0D9488'}
                  onBlur={e => e.target.style.borderColor = '#CCFBF1'}
                />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: '#9ca3af' }}>
                <FiFilter size={14}/> Filter:
              </div>
              {['', 'open', 'in-progress', 'resolved'].map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                  style={{
                    background: statusFilter === s ? '#0D9488' : '#F0FDF9',
                    color: statusFilter === s ? 'white' : '#6b7280',
                    border: '1px solid #CCFBF1',
                  }}>
                  {s === '' ? 'All' : statusLabels[s]}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl animate-pulse"
                    style={{ height: '100px', border: '1px solid #CCFBF1' }}/>
                ))}
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center"
                style={{ border: '1px solid #CCFBF1' }}>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map(issue => {
                  const cat = categoryColors[issue.category] || categoryColors.other
                  const sta = statusColors[issue.status]     || statusColors.open
                  return (
                    <div key={issue._id} className="bg-white rounded-2xl p-5"
                      style={{ border: '1px solid #CCFBF1' }}>
                      <div className="flex items-start gap-4">

                        {/* Thumbnail */}
                        {issue.photos?.[0] ? (
                          <img src={issue.photos[0]} alt=""
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            style={{ border: '1px solid #CCFBF1' }}/>
                        ) : (
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: '#F0FDF9' }}>
                            <FiMapPin size={20} style={{ color: '#0D9488' }}/>
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{ background: cat.bg, color: cat.color }}>
                              {issue.category}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{ background: sta.bg, color: sta.color }}>
                              {issue.status}
                            </span>
                          </div>
                          <p className="font-black text-gray-900 text-sm mb-1 truncate">
                            {issue.title}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                            {issue.location?.address && (
                              <span className="flex items-center gap-1">
                                <FiMapPin size={11}/>{issue.location.address.split(',')[0]}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FiClock size={11}/>
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiArrowUp size={11}/>{issue.upvotes?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          {/* Assign to official */}
                          {officials.length > 0 && (
                            <div className="relative">
                              <select
                                onChange={e => e.target.value && handleAssign(issue._id, e.target.value)}
                                defaultValue=""
                                style={selectStyle}
                                disabled={assigning === issue._id}
                              >
                                <option value="">Assign to...</option>
                                {officials.map(o => (
                                  <option key={o._id} value={o._id}>{o.name}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <Link to={`/issues/${issue._id}`}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
                            style={{ background: '#F0FDF9', color: '#0D9488' }}>
                            View <FiArrowRight size={12}/>
                          </Link>

                          <button
                            onClick={() => handleDelete(issue._id)}
                            disabled={deleting === issue._id}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                            style={{ background: '#fff0f0', color: '#e53e3e' }}>
                            {deleting === issue._id
                              ? '...'
                              : <><FiTrash2 size={12}/> Delete</>}
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #CCFBF1' }}>
            <div className="p-6" style={{ borderBottom: '1px solid #CCFBF1' }}>
              <h2 className="text-lg font-black text-gray-900">All users</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse"
                    style={{ background: '#F0FDF9' }}/>
                ))}
              </div>
            ) : (
              <div>
                {users.map((u, idx) => (
                  <div key={u._id}
                    className="flex items-center gap-4 px-6 py-4 transition-all hover:bg-gray-50"
                    style={{ borderBottom: idx < users.length - 1 ? '1px solid #CCFBF1' : 'none' }}>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: '#CCFBF1', color: '#0D9488' }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>

                    {/* Role badge */}
                    <span className="text-xs font-bold px-3 py-1 rounded-full capitalize flex-shrink-0"
                      style={{
                        background: u.role === 'admin'
                          ? '#f3e8ff'
                          : u.role === 'official'
                          ? '#CCFBF1'
                          : '#F0FDF9',
                        color: u.role === 'admin'
                          ? '#7c3aed'
                          : u.role === 'official'
                          ? '#0D9488'
                          : '#6b7280',
                      }}>
                      {u.role}
                    </span>

                    {/* Role change */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={selectStyle}
                      >
                        <option value="citizen">Citizen</option>
                        <option value="official">Official</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}