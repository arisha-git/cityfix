import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getIssue, upvoteIssue, getComments, addComment } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiMapPin, FiClock, FiArrowUp, FiArrowLeft, FiUser, FiSend, FiTag, FiCheckCircle } from 'react-icons/fi'

const categoryColors = {
  roads:       { bg: '#fff7ed', color: '#c2410c' },
  electricity: { bg: '#fefce8', color: '#a16207' },
  water:       { bg: '#eff6ff', color: '#1d4ed8' },
  sanitation:  { bg: '#f0fdf4', color: '#15803d' },
  parks:       { bg: '#f0fdfa', color: '#0f766e' },
  other:       { bg: '#F0FDF9', color: '#0D9488' },
}

const statusColors = {
  open:          { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:      { bg: '#f0fff4', color: '#38a169' },
}

const statusSteps  = ['open', 'in-progress', 'resolved']
const statusLabels = { open: 'Reported', 'in-progress': 'In Progress', resolved: 'Resolved' }

export default function IssueDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [issue, setIssue]       = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [upvoting, setUpvoting] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    Promise.all([getIssue(id), getComments(id)])
      .then(([ir, cr]) => { setIssue(ir.data); setComments(cr.data) })
      .catch(() => toast.error('Issue not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpvote = async () => {
    if (!user) return toast.error('Sign in to upvote')
    setUpvoting(true)
    try { const r = await upvoteIssue(id); setIssue(r.data) }
    catch { toast.error('Failed to upvote') }
    finally { setUpvoting(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    try {
      const r = await addComment(id, body)
      setComments([...comments, r.data])
      setBody('')
      toast.success('Comment added')
    } catch { toast.error('Failed to add comment') }
    finally { setSending(false) }
  }

  if (loading) return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl animate-pulse"
            style={{ height: i === 0 ? '320px' : '80px', border: '1px solid #CCFBF1' }}/>
        ))}
      </div>
    </div>
  )

  if (!issue) return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }} className="flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Issue not found</h2>
        <Link to="/issues" className="text-sm font-bold" style={{ color: '#0D9488' }}>Back to issues</Link>
      </div>
    </div>
  )

  const cat = categoryColors[issue.category] || categoryColors.other
  const sta = statusColors[issue.status]     || statusColors.open
  const currentStep = statusSteps.indexOf(issue.status)
  const hasUpvoted  = user && issue.upvotes?.includes(user.id)

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold mb-8"
          style={{ color: '#0D9488' }}>
          <FiArrowLeft size={16}/> Back to issues
        </button>

        {/* Photos */}
        {issue.photos?.length > 0 && (
          <div className="mb-6">
            <img src={issue.photos[activePhoto]} alt={issue.title}
              className="w-full rounded-2xl object-cover"
              style={{ height: '360px', border: '1px solid #CCFBF1' }}/>
            {issue.photos.length > 1 && (
              <div className="flex gap-3 mt-3">
                {issue.photos.map((p, i) => (
                  <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                    className="w-20 h-20 object-cover rounded-xl cursor-pointer"
                    style={{ border: activePhoto === i ? '3px solid #0D9488' : '2px solid #CCFBF1' }}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #CCFBF1' }}>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
              style={{ background: cat.bg, color: cat.color }}>{issue.category}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
              style={{ background: sta.bg, color: sta.color }}>{issue.status}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{issue.title}</h1>
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
            {issue.location?.address && (
              <div className="flex items-center gap-1"><FiMapPin size={14}/>{issue.location.address}</div>
            )}
            <div className="flex items-center gap-1">
              <FiClock size={14}/>
              {new Date(issue.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
            </div>
            {issue.reportedBy && (
              <div className="flex items-center gap-1"><FiUser size={14}/>{issue.reportedBy.name}</div>
            )}
            {issue.sector && (
              <div className="flex items-center gap-1"><FiTag size={14}/>{issue.sector}</div>
            )}
          </div>
          <p className="text-gray-600 leading-relaxed mb-8">{issue.description}</p>
          <button onClick={handleUpvote} disabled={upvoting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: hasUpvoted ? '#0D9488' : '#F0FDF9',
              color: hasUpvoted ? 'white' : '#0D9488',
              border: '2px solid #CCFBF1',
            }}>
            <FiArrowUp size={16}/>
            {issue.upvotes?.length || 0} upvotes
            {!hasUpvoted && ' · Upvote this issue'}
          </button>
        </div>

        {/* Status timeline */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #CCFBF1' }}>
          <h2 className="text-lg font-black text-gray-900 mb-6">Issue progress</h2>
          <div className="flex items-center">
            {statusSteps.map((step, i) => {
              const done   = i <= currentStep
              const active = i === currentStep
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: done ? '#0D9488' : '#F0FDF9',
                        color: done ? 'white' : '#9ca3af',
                        border: active ? '3px solid #0D9488' : '2px solid #CCFBF1',
                      }}>
                      {done && !active ? <FiCheckCircle size={18}/> : i + 1}
                    </div>
                    <span className="text-xs font-bold mt-2 text-center"
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
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #CCFBF1' }}>
          <h2 className="text-lg font-black text-gray-900 mb-6">Comments ({comments.length})</h2>
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No comments yet. Be the first.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map(c => (
                <div key={c._id} className="flex gap-4 p-4 rounded-xl" style={{ background: '#F0FDF9' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: '#CCFBF1', color: '#0D9488' }}>
                    {c.author?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{c.author?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {user ? (
            <form onSubmit={handleComment}>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: '#0D9488', color: 'white' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 flex gap-3">
                  <input type="text" value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                    style={{ background: '#F0FDF9', border: '2px solid #CCFBF1' }}
                    onFocus={e => e.target.style.borderColor = '#0D9488'}
                    onBlur={e => e.target.style.borderColor = '#CCFBF1'}
                  />
                  <button type="submit" disabled={sending || !body.trim()}
                    className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                    style={{ background: '#0D9488' }}>
                    <FiSend size={14}/>{sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-xl p-4 text-center" style={{ background: '#F0FDF9' }}>
              <p className="text-sm text-gray-500">
                <Link to="/login" className="font-bold" style={{ color: '#0D9488' }}>Sign in</Link>{' '}
                to leave a comment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}