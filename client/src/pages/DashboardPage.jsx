import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getIssues } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { FiPlusCircle, FiMapPin, FiClock, FiArrowUp, FiArrowRight } from 'react-icons/fi'

const statusColors = {
  open:          { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:      { bg: '#f0fff4', color: '#38a169' },
  closed:        { bg: '#F0FDF9', color: '#0D9488' },
}

const categoryColors = {
  roads:       { bg: '#fff7ed', color: '#c2410c' },
  electricity: { bg: '#fefce8', color: '#a16207' },
  water:       { bg: '#eff6ff', color: '#1d4ed8' },
  sanitation:  { bg: '#f0fdf4', color: '#15803d' },
  parks:       { bg: '#f0fdfa', color: '#0f766e' },
  other:       { bg: '#F0FDF9', color: '#0D9488' },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [issues, setIssues]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getIssues()
      .then(res => {
        const mine = res.data.filter(i =>
          i.reportedBy?._id === user?.id || i.reportedBy === user?.id)
        setIssues(mine)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:      issues.length,
    open:       issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved:   issues.filter(i => i.status === 'resolved').length,
  }

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-1">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400">Here's a summary of your reported issues</p>
          </div>
          <Link to="/report"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: '#0D9488' }}>
            <FiPlusCircle size={16}/> Report new issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total reported', value: stats.total,      color: '#0D9488' },
            { label: 'Open',           value: stats.open,       color: '#e53e3e' },
            { label: 'In progress',    value: stats.inProgress, color: '#d97706' },
            { label: 'Resolved',       value: stats.resolved,   color: '#38a169' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #CCFBF1' }}>
              <p className="text-xs font-bold text-gray-400 mb-2">{label}</p>
              <p className="text-4xl font-black" style={{ color }}>
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Issues list */}
        <div className="bg-white rounded-2xl" style={{ border: '1px solid #CCFBF1' }}>
          <div className="flex items-center justify-between p-6"
            style={{ borderBottom: '1px solid #CCFBF1' }}>
            <h2 className="text-lg font-black text-gray-900">Your issues</h2>
            <Link to="/issues" className="text-sm font-bold flex items-center gap-1"
              style={{ color: '#0D9488' }}>
              View all <FiArrowRight size={14}/>
            </Link>
          </div>

          {loading ? (
            <div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-5 flex gap-4 items-center"
                  style={{ borderBottom: '1px solid #CCFBF1' }}>
                  <div className="w-14 h-14 rounded-xl animate-pulse flex-shrink-0"
                    style={{ background: '#F0FDF9' }}/>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-lg animate-pulse" style={{ background: '#F0FDF9' }}/>
                    <div className="h-3 w-1/2 rounded-lg animate-pulse" style={{ background: '#F0FDF9' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#F0FDF9' }}>
                <FiMapPin size={24} style={{ color: '#0D9488' }}/>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">No issues yet</h3>
              <p className="text-gray-400 text-sm mb-6">You haven't reported any issues yet</p>
              <Link to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: '#0D9488' }}>
                <FiPlusCircle size={16}/> Report your first issue
              </Link>
            </div>
          ) : (
            <div>
              {issues.map(issue => {
                const sta = statusColors[issue.status]    || statusColors.open
                const cat = categoryColors[issue.category] || categoryColors.other
                return (
                  <Link key={issue._id} to={`/issues/${issue._id}`}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-all"
                    style={{ borderBottom: '1px solid #CCFBF1' }}>
                    {issue.photos?.[0] ? (
                      <img src={issue.photos[0]} alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        style={{ border: '1px solid #CCFBF1' }}/>
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#F0FDF9' }}>
                        <FiMapPin size={20} style={{ color: '#0D9488' }}/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: cat.bg, color: cat.color }}>{issue.category}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: sta.bg, color: sta.color }}>{issue.status}</span>
                      </div>
                      <p className="font-black text-gray-900 text-sm truncate">{issue.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {issue.location?.address && (
                          <span className="flex items-center gap-1 truncate">
                            <FiMapPin size={11}/>{issue.location.address}
                          </span>
                        )}
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <FiClock size={11}/>{new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <FiArrowUp size={11}/>{issue.upvotes?.length || 0}
                        </span>
                      </div>
                    </div>
                    <FiArrowRight size={16} style={{ color: '#5eead4', flexShrink: 0 }}/>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}