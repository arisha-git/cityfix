import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getIssues, updateStatus } from '../services/api'
import toast from 'react-hot-toast'
import {
  FiMapPin, FiClock, FiArrowUp,
  FiArrowRight, FiCheckCircle, FiFilter
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

const statusSteps  = ['open', 'in-progress', 'resolved']
const statusLabels = { open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved' }

export default function OfficialPage() {
  const { user } = useAuthStore()
  const [issues, setIssues]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    getIssues()
      .then(res => {
        const mine = res.data.filter(i =>
          i.sector === user?.sector ||
          i.assignedTo === user?.id ||
          i.assignedTo?._id === user?.id
        )
        setIssues(mine)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdating(issueId)
    try {
      const res = await updateStatus(issueId, newStatus)
      setIssues(issues.map(i => i._id === issueId ? res.data : i))
      toast.success(`Status updated to ${statusLabels[newStatus]}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter ? issues.filter(i => i.status === filter) : issues

  const stats = {
    total:      issues.length,
    open:       issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved:   issues.filter(i => i.status === 'resolved').length,
  }

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: '#CCFBF1', color: '#0D9488' }}>
            🏛️ Official Panel
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400">Manage and update issues assigned to your department</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total assigned', value: stats.total,      color: '#0D9488' },
            { label: 'Open',           value: stats.open,       color: '#e53e3e' },
            { label: 'In progress',    value: stats.inProgress, color: '#d97706' },
            { label: 'Resolved',       value: stats.resolved,   color: '#38a169' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5"
              style={{ border: '1px solid #CCFBF1' }}>
              <p className="text-xs font-bold text-gray-400 mb-2">{label}</p>
              <p className="text-4xl font-black" style={{ color }}>
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-center"
          style={{ border: '1px solid #CCFBF1' }}>
          <div className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#9ca3af' }}>
            <FiFilter size={14}/> Filter by status:
          </div>
          {['', 'open', 'in-progress', 'resolved'].map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{
                background: filter === s ? '#0D9488' : '#F0FDF9',
                color: filter === s ? 'white' : '#6b7280',
                border: '1px solid #CCFBF1',
              }}>
              {s === '' ? 'All' : statusLabels[s]}
            </button>
          ))}
        </div>

        {/* Issues */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse"
                style={{ border: '1px solid #CCFBF1', height: '120px' }}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center"
            style={{ border: '1px solid #CCFBF1' }}>
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">All clear!</h3>
            <p className="text-gray-400">No issues found for the selected filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(issue => {
              const cat = categoryColors[issue.category] || categoryColors.other
              const sta = statusColors[issue.status]     || statusColors.open
              const currentStep = statusSteps.indexOf(issue.status)

              return (
                <div key={issue._id} className="bg-white rounded-2xl p-6"
                  style={{ border: '1px solid #CCFBF1' }}>

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                          style={{ background: cat.bg, color: cat.color }}>
                          {issue.category}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                          style={{ background: sta.bg, color: sta.color }}>
                          {issue.status}
                        </span>
                      </div>
                      <h3 className="font-black text-gray-900 text-lg mb-1">{issue.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{issue.description}</p>
                    </div>

                    {/* Thumbnail */}
                    {issue.photos?.[0] && (
                      <img src={issue.photos[0]} alt=""
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        style={{ border: '1px solid #CCFBF1' }}/>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-5">
                    {issue.location?.address && (
                      <div className="flex items-center gap-1">
                        <FiMapPin size={12}/>{issue.location.address}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <FiClock size={12}/>
                      {new Date(issue.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiArrowUp size={12}/>{issue.upvotes?.length || 0} upvotes
                    </div>
                  </div>

                  {/* Mini status timeline */}
                  <div className="flex items-center mb-5">
                    {statusSteps.map((step, i) => {
                      const done   = i <= currentStep
                      const active = i === currentStep
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                              style={{
                                background: done ? '#0D9488' : '#F0FDF9',
                                color: done ? 'white' : '#9ca3af',
                                border: active ? '2px solid #0D9488' : '2px solid #CCFBF1',
                              }}>
                              {done && !active ? <FiCheckCircle size={14}/> : i + 1}
                            </div>
                            <span className="text-xs font-bold mt-1"
                              style={{ color: done ? '#0D9488' : '#9ca3af' }}>
                              {statusLabels[step]}
                            </span>
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div className="flex-1 h-1 mx-2 rounded-full"
                              style={{ background: i < currentStep ? '#0D9488' : '#CCFBF1' }}/>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {statusSteps
                      .filter(s => s !== issue.status)
                      .map(s => (
                        <button key={s}
                          onClick={() => handleStatusChange(issue._id, s)}
                          disabled={updating === issue._id}
                          className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                          style={{
                            background: statusColors[s].bg,
                            color: statusColors[s].color,
                            border: `1px solid ${statusColors[s].color}30`,
                          }}>
                          {updating === issue._id ? 'Updating...' : `Mark as ${statusLabels[s]}`}
                        </button>
                      ))}
                    <Link to={`/issues/${issue._id}`}
                      className="ml-auto flex items-center gap-1 text-sm font-bold"
                      style={{ color: '#0D9488' }}>
                      View full issue <FiArrowRight size={14}/>
                    </Link>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}