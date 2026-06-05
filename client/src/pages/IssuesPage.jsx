import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getIssues } from '../services/api'
import {
  FiMapPin, FiFilter, FiSearch,
  FiChevronDown, FiArrowUp, FiClock
} from 'react-icons/fi'

const categoryColors = {
  roads:       { bg: '#fff7ed', color: '#c2410c' },
  electricity: { bg: '#fefce8', color: '#a16207' },
  water:       { bg: '#eff6ff', color: '#1d4ed8' },
  sanitation:  { bg: '#f0fdf4', color: '#15803d' },
  parks:       { bg: '#f0fdfa', color: '#0f766e' },
  other:       { bg: '#f5f3ff', color: '#6C63FF' },
}

const statusColors = {
  open:          { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:      { bg: '#f0fff4', color: '#38a169' },
}

function IssueCard({ issue }) {
  const cat = categoryColors[issue.category] || categoryColors.other
  const sta = statusColors[issue.status]     || statusColors.open

  return (
    <Link
      to={`/issues/${issue._id}`}
      className="bg-white rounded-2xl overflow-hidden block transition-all hover:-translate-y-1"
      style={{ border: '1px solid #ede9ff' }}
    >
      {issue.photos?.[0] ? (
        <img
          src={issue.photos[0]}
          alt={issue.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center"
          style={{ background: '#f7f6ff' }}
        >
          <FiMapPin size={32} style={{ color: '#c4b5fd' }} />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: cat.bg, color: cat.color }}
          >
            {issue.category}
          </span>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: sta.bg, color: sta.color }}
          >
            {issue.status}
          </span>
        </div>

        <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">
          {issue.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {issue.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <FiMapPin size={12} />
            <span className="truncate max-w-[140px]">
              {issue.location?.address || 'No location'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FiArrowUp size={12} />
              <span>{issue.upvotes?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock size={12} />
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #ede9ff' }}>
      <div className="w-full h-48 animate-pulse" style={{ background: '#f0efff' }} />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full animate-pulse" style={{ background: '#f0efff' }} />
          <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: '#f0efff' }} />
        </div>
        <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ background: '#f0efff' }} />
        <div className="h-3 w-full rounded-lg animate-pulse" style={{ background: '#f0efff' }} />
        <div className="h-3 w-2/3 rounded-lg animate-pulse" style={{ background: '#f0efff' }} />
      </div>
    </div>
  )
}

export default function IssuesPage() {
  const [issues, setIssues]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus]     = useState('')
  const [sort, setSort]         = useState('newest')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (category) params.category = category
    if (status)   params.status   = status
    if (sort)     params.sort     = sort
    getIssues(params)
      .then(res => setIssues(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, status, sort])

  const filtered = issues.filter(issue =>
    issue.title.toLowerCase().includes(search.toLowerCase()) ||
    issue.location?.address?.toLowerCase().includes(search.toLowerCase())
  )

  const selectStyle = {
    background: 'white',
    border: '2px solid #ede9ff',
    color: '#374151',
    borderRadius: '14px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    paddingRight: '36px',
  }

  return (
    <div style={{ background: '#f0efff', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">All Issues</h1>
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${filtered.length} issue${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Filters */}
        <div
          className="bg-white rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-center"
          style={{ border: '1px solid #ede9ff' }}
        >

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2"
              size={16}
              style={{ color: '#9ca3af' }}
            />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition"
              style={{
                background: '#f7f6ff',
                border: '2px solid #ede9ff',
                color: '#374151',
              }}
              onFocus={e => e.target.style.borderColor = '#6C63FF'}
              onBlur={e => e.target.style.borderColor = '#ede9ff'}
            />
          </div>

          <div className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: '#9ca3af' }}>
            <FiFilter size={14} />
            Filter:
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={selectStyle}
            >
              <option value="">All categories</option>
              <option value="roads">Roads</option>
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="sanitation">Sanitation</option>
              <option value="parks">Parks</option>
              <option value="other">Other</option>
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={14}
              style={{ color: '#9ca3af' }}
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={selectStyle}
            >
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={14}
              style={{ color: '#9ca3af' }}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={selectStyle}
            >
              <option value="newest">Newest first</option>
              <option value="upvotes">Most upvoted</option>
            </select>
            <FiChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              size={14}
              style={{ color: '#9ca3af' }}
            />
          </div>

          {/* Clear filters */}
          {(category || status || search || sort !== 'newest') && (
            <button
              onClick={() => {
                setCategory('')
                setStatus('')
                setSearch('')
                setSort('newest')
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ color: '#6C63FF', background: '#f0efff' }}
            >
              Clear all
            </button>
          )}

        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#f0efff' }}
            >
              <FiMapPin size={28} style={{ color: '#6C63FF' }} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-400 mb-6">
              {search || category || status
                ? 'Try adjusting your filters'
                : 'Be the first to report an issue in your area'}
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: '#6C63FF' }}
            >
              Report an issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}