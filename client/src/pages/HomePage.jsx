import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getIssues } from '../services/api'
import {
  FiArrowRight, FiMapPin, FiCheckCircle,
  FiAlertCircle, FiUsers, FiZap, FiShield, FiTrendingUp
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
  open:        { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:    { bg: '#f0fff4', color: '#38a169' },
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
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 flex items-center justify-center"
          style={{ background: '#f7f6ff' }}>
          <FiMapPin size={32} style={{ color: '#c4b5fd' }} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: cat.bg, color: cat.color }}>
            {issue.category}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: sta.bg, color: sta.color }}>
            {issue.status}
          </span>
        </div>
        <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">
          {issue.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {issue.description}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FiMapPin size={12} />
          <span className="truncate">{issue.location?.address || 'Location not set'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    getIssues({ sort: 'newest' })
      .then(res => setIssues(res.data.slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div style={{ background: '#f0efff' }}>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="max-w-2xl">

        

          <h1 className="text-6xl font-black text-gray-900 leading-none mb-6">
            Spot a<br />
            <span style={{ color: '#6C63FF' }}>problem?</span><br />
            Report it.
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-lg">
            CityFix connects citizens directly to the departments
            responsible for fixing it and tracks the response publicly.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/report"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all"
              style={{ background: '#6C63FF' }}
            >
              Report an issue
              <FiArrowRight size={18} />
            </Link>
            <Link
              to="/issues"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all"
              style={{
                background: 'white',
                color: '#6C63FF',
                border: '2px solid #ede9ff',
              }}
            >
              Browse issues
            </Link>
          </div>

        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: '#6C63FF' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiAlertCircle, num: '2,400+', label: 'Issues Reported'  },
              { icon: FiCheckCircle, num: '89%',    label: 'Resolution Rate'  },
              { icon: FiUsers,       num: '12k+',   label: 'Active Citizens'  },
              { icon: FiTrendingUp,  num: '48h',    label: 'Avg Response Time'},
            ].map(({ icon: Icon, num, label }) => (
              <div key={label} className="text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <Icon size={20} color="white" />
                </div>
                <p className="text-white text-3xl font-black">{num}</p>
                <p className="text-purple-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-400 text-lg">Four steps to get any issue fixed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Spot the issue',
              desc: 'See a pothole, broken light, or waste problem in your area.',
            },
            {
              num: '02',
              title: 'Take a photo',
              desc: 'Capture it on your phone and drop a pin on the map.',
            },
            {
              num: '03',
              title: 'Submit to CityFix',
              desc: 'We route it directly to the right government department.',
            },
            {
              num: '04',
              title: 'Track & resolve',
              desc: 'Follow the progress publicly until the issue is fixed.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6"
              style={{ border: '1px solid #ede9ff' }}
            >
              <div
                className="text-3xl font-black mb-4"
                style={{ color: '#ede9ff' }}
              >
                {step.num}
              </div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Why CityFix?</h2>
            <p className="text-gray-400 text-lg">Built for citizens, not bureaucrats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FiZap,
                title: 'Simple reporting',
                desc: 'Report any issue in under 60 seconds. No forms, no queues, no phone calls.',
                iconBg: '#f0efff',
                iconColor: '#6C63FF',
              },
              {
                icon: FiShield,
                title: 'Government accountability',
                desc: 'Issues are publicly visible. Departments are held accountable for every report.',
                iconBg: '#fff0f0',
                iconColor: '#e53e3e',
              },
              {
                icon: FiUsers,
                title: 'Community driven',
                desc: 'Upvote issues that matter to you. The more votes, the faster the response.',
                iconBg: '#f0fff4',
                iconColor: '#38a169',
              },
            ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
              <div
                key={title}
                className="rounded-2xl p-8"
                style={{ background: '#f7f6ff', border: '1px solid #ede9ff' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: iconBg }}
                >
                  <Icon size={22} style={{ color: iconColor }} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent issues ── */}
      {issues.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-1">Recent issues</h2>
              <p className="text-gray-400">Latest reports from your community</p>
            </div>
            <Link
              to="/issues"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ color: '#6C63FF', background: 'white', border: '2px solid #ede9ff' }}
            >
              View all <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA banner ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div
          className="rounded-3xl p-12 text-center"
          style={{ background: '#6C63FF' }}
        >
          <h2 className="text-4xl font-black text-white mb-3">
            See something that needs fixing?
          </h2>
          <p className="text-purple-200 text-lg mb-8 max-w-md mx-auto">
            Don't scroll past it. Report it in 60 seconds and make your city better.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all"
            style={{ background: 'white', color: '#6C63FF' }}
          >
            Report an issue now
            <FiArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  )
}