import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getIssues } from '../services/api'
import { FiArrowRight, FiMapPin, FiCheckCircle, FiAlertCircle, FiUsers, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

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

function CityIllustration() {
  return (
    <svg viewBox="0 0 520 420" className="w-full max-w-xl" xmlns="http://www.w3.org/2000/svg">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CCFBF1"/>
          <stop offset="100%" stopColor="#F0FDF9"/>
        </linearGradient>
        <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D9488"/>
          <stop offset="100%" stopColor="#0f766e"/>
        </linearGradient>
        <linearGradient id="hill2Grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14b8a6"/>
          <stop offset="100%" stopColor="#0D9488"/>
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="520" height="420" fill="url(#skyGrad)" rx="24"/>

      {/* Clouds */}
      <g className="animate-float" style={{animationDuration:'6s'}}>
        <ellipse cx="80" cy="70" rx="38" ry="18" fill="white" opacity="0.85"/>
        <ellipse cx="105" cy="62" rx="28" ry="16" fill="white" opacity="0.85"/>
        <ellipse cx="58" cy="65" rx="22" ry="13" fill="white" opacity="0.85"/>
      </g>
      <g className="animate-float" style={{animationDuration:'8s', animationDelay:'1s'}}>
        <ellipse cx="390" cy="55" rx="45" ry="20" fill="white" opacity="0.75"/>
        <ellipse cx="420" cy="46" rx="30" ry="16" fill="white" opacity="0.75"/>
        <ellipse cx="365" cy="50" rx="25" ry="14" fill="white" opacity="0.75"/>
      </g>

      {/* Sun */}
      <circle cx="440" cy="80" r="30" fill="#F59E0B" opacity="0.25" className="animate-pulse-slow"/>
      <circle cx="440" cy="80" r="22" fill="#F59E0B" opacity="0.5"/>
      <circle cx="440" cy="80" r="14" fill="#F59E0B"/>

      {/* Buildings back */}
      <rect x="20"  y="160" width="55" height="170" rx="6" fill="#5eead4" opacity="0.5"/>
      <rect x="30"  y="140" width="35" height="22"  rx="4" fill="#5eead4" opacity="0.4"/>
      <rect x="430" y="150" width="65" height="180" rx="6" fill="#5eead4" opacity="0.5"/>
      <rect x="445" y="128" width="35" height="24"  rx="4" fill="#5eead4" opacity="0.4"/>
      <rect x="380" y="180" width="48" height="150" rx="5" fill="#99f6e4" opacity="0.5"/>

      {/* Main buildings */}
      <rect x="80"  y="120" width="70" height="210" rx="8" fill="#0D9488"/>
      <rect x="93"  y="96"  width="44" height="28"  rx="5" fill="#0f766e"/>
      <rect x="160" y="90"  width="85" height="240" rx="8" fill="#0f766e"/>
      <rect x="178" y="68"  width="50" height="26"  rx="4" fill="#134e4a"/>
      <rect x="255" y="140" width="60" height="190" rx="7" fill="#14b8a6"/>
      <rect x="325" y="110" width="55" height="220" rx="7" fill="#0D9488"/>
      <rect x="337" y="88"  width="32" height="26"  rx="4" fill="#0f766e"/>

      {/* Windows */}
      {[[88,130],[88,155],[88,180],[88,205],[112,130],[112,155],[112,180],[112,205]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="12" height="14" rx="3" fill="white" opacity="0.6"/>
      ))}
      {[[168,100],[168,128],[168,156],[168,184],[168,212],[200,100],[200,128],[200,156],[200,184],[200,212]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="14" height="16" rx="3" fill="white" opacity="0.55"/>
      ))}
      {[[330,120],[330,148],[330,176],[330,204],[355,120],[355,148],[355,176],[355,204]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="11" height="14" rx="3" fill="white" opacity="0.6"/>
      ))}

      {/* Hills */}
      <ellipse cx="260" cy="390" rx="320" ry="90" fill="url(#hillGrad)"/>
      <ellipse cx="100" cy="380" rx="180" ry="70" fill="url(#hill2Grad)" opacity="0.7"/>
      <ellipse cx="420" cy="385" rx="160" ry="65" fill="url(#hill2Grad)" opacity="0.6"/>

      {/* Road */}
      <rect x="200" y="340" width="120" height="30" rx="6" fill="rgba(255,255,255,0.2)"/>
      <rect x="253" y="346" width="14" height="5"   rx="2" fill="rgba(255,255,255,0.5)"/>

      {/* Person 1 — reporting */}
      <g className="animate-bounce-slow" style={{animationDelay:'0s'}}>
        <circle cx="220" cy="295" r="18" fill="#fde68a"/>
        <rect x="207" y="313" width="26" height="38" rx="10" fill="#0D9488"/>
        <rect x="200" y="320" width="13" height="7"  rx="3"  fill="#0D9488"/>
        <rect x="220" y="320" width="13" height="7"  rx="3"  fill="#0D9488"/>
        <rect x="209" y="350" width="10" height="18" rx="5"  fill="#fde68a"/>
        <rect x="221" y="350" width="10" height="18" rx="5"  fill="#fde68a"/>
        {/* phone */}
        <rect x="233" y="316" width="11" height="16" rx="3" fill="#1e293b"/>
        <rect x="235" y="318" width="7"  height="10" rx="1" fill="#38bdf8"/>
      </g>

      {/* Person 2 — cycling */}
      <g className="animate-float" style={{animationDuration:'4s', animationDelay:'0.5s'}}>
        <circle cx="370" cy="300" r="15" fill="#fde68a"/>
        <rect x="359" y="315" width="22" height="30" rx="8" fill="#14b8a6"/>
        {/* bike */}
        <circle cx="348" cy="345" r="12" fill="none" stroke="#0f172a" strokeWidth="2.5"/>
        <circle cx="382" cy="345" r="12" fill="none" stroke="#0f172a" strokeWidth="2.5"/>
        <line x1="355" y1="335" x2="375" y2="335" stroke="#0f172a" strokeWidth="2"/>
        <line x1="365" y1="315" x2="355" y2="335" stroke="#0f172a" strokeWidth="2"/>
        <line x1="365" y1="315" x2="382" y2="335" stroke="#0f172a" strokeWidth="2"/>
      </g>

      {/* Person 3 — scooter */}
      <g style={{transform:'translateX(0)'}}>
        <circle cx="460" cy="305" r="13" fill="#fde68a"/>
        <rect x="450" y="318" width="20" height="26" rx="7" fill="#f97316"/>
        <circle cx="444" cy="342" r="9"  fill="none" stroke="#0f172a" strokeWidth="2"/>
        <circle cx="470" cy="342" r="9"  fill="none" stroke="#0f172a" strokeWidth="2"/>
        <line x1="449" y1="334" x2="465" y2="334" stroke="#0f172a" strokeWidth="2"/>
      </g>

      {/* Map pin floating */}
      <g className="animate-bounce-slow" style={{animationDelay:'0.3s'}}>
        <circle cx="220" cy="255" r="14" fill="#ef4444"/>
        <circle cx="220" cy="255" r="7"  fill="white"/>
        <path d="M220 269 L220 280" stroke="#ef4444" strokeWidth="3" strokeLinecap="round"/>
      </g>

      {/* Floating notification cards */}
      <g className="animate-float" style={{animationDuration:'3.5s', animationDelay:'0.2s'}}>
        <rect x="18" y="240" width="130" height="58" rx="14" fill="white"
          style={{filter:'drop-shadow(0 4px 12px rgba(13,148,136,0.15))'}}/>
        <circle cx="44" cy="269" r="14" fill="#CCFBF1"/>
        <text x="37" y="274" fontSize="14">📍</text>
        <rect x="66" y="257" width="65" height="7" rx="3.5" fill="#0D9488" opacity="0.35"/>
        <rect x="66" y="270" width="45" height="6" rx="3"   fill="#0D9488" opacity="0.2"/>
        <rect x="66" y="282" width="30" height="5" rx="2.5" fill="#14b8a6" opacity="0.3"/>
      </g>

      <g className="animate-float" style={{animationDuration:'4.5s', animationDelay:'1s'}}>
        <rect x="372" y="230" width="130" height="58" rx="14" fill="white"
          style={{filter:'drop-shadow(0 4px 12px rgba(13,148,136,0.15))'}}/>
        <circle cx="398" cy="259" r="14" fill="#dcfce7"/>
        <text x="391" y="264" fontSize="14">✅</text>
        <rect x="420" y="247" width="65" height="7" rx="3.5" fill="#16a34a" opacity="0.35"/>
        <rect x="420" y="260" width="45" height="6" rx="3"   fill="#16a34a" opacity="0.2"/>
        <rect x="420" y="272" width="55" height="5" rx="2.5" fill="#16a34a" opacity="0.3"/>
      </g>

      {/* Stars */}
      <text x="140" y="85"  fontSize="18" fill="#F59E0B" opacity="0.8" className="animate-pulse-slow">✦</text>
      <text x="310" y="105" fontSize="13" fill="#0D9488" opacity="0.6" className="animate-spin-slow">✦</text>
      <text x="470" y="170" fontSize="16" fill="#F59E0B" opacity="0.7" className="animate-bounce-slow">✦</text>
      <text x="40"  y="200" fontSize="11" fill="#14b8a6" opacity="0.5">✦</text>
    </svg>
  )
}

function IssueCard({ issue }) {
  const cat = categoryColors[issue.category] || categoryColors.other
  const sta = statusColors[issue.status]     || statusColors.open
  return (
    <Link to={`/issues/${issue._id}`}
      className="bg-white rounded-2xl overflow-hidden block transition-all hover:-translate-y-1"
      style={{ border: '1px solid #CCFBF1' }}>
      {issue.photos?.[0] ? (
        <img src={issue.photos[0]} alt={issue.title} className="w-full h-44 object-cover"/>
      ) : (
        <div className="w-full h-44 flex items-center justify-center" style={{ background: '#F0FDF9' }}>
          <FiMapPin size={32} style={{ color: '#5eead4' }}/>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: cat.bg, color: cat.color }}>{issue.category}</span>
          <span className="text-xs font-bold px-3 py-1 rounded-full capitalize"
            style={{ background: sta.bg, color: sta.color }}>{issue.status}</span>
        </div>
        <h3 className="font-black text-gray-900 text-base mb-1 line-clamp-1">{issue.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{issue.description}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FiMapPin size={12}/>
          <span className="truncate">{issue.location?.address || 'No location'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [issues, setIssues] = useState([])
  const [statsRef, statsInView]     = useInView()
  const [howRef,   howInView]       = useInView()
  const [whyRef,   whyInView]       = useInView()
  const [issuesRef, issuesInView]   = useInView()

  useEffect(() => {
    getIssues({ sort: 'newest' })
      .then(res => setIssues(res.data.slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div style={{ background: '#F0FDF9' }}>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Text */}
          <div className="flex-1 animate-fade-up">
            
            <h1 className="text-6xl font-black text-gray-900 leading-none mb-6">
              Spot a<br/>
              <span style={{ color: '#0D9488' }}>problem?</span><br/>
              Report it.
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-lg">
              CityFix connects citizens directly to the departments
              responsible for fixing it  and tracks every response publicly.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/report"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90"
                style={{ background: '#0D9488' }}>
                Report an issue <FiArrowRight size={18}/>
              </Link>
              <Link to="/issues"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all"
                style={{ background: 'white', color: '#0D9488', border: '2px solid #CCFBF1' }}>
                Browse issues
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex-1 flex justify-center animate-fade-up delay-200">
            <CityIllustration/>
          </div>
        </div>
      </section>

  

      {/* ── How it works ── */}
      <section ref={howRef} className="max-w-7xl mx-auto px-6 py-24">
        <div className={`text-center mb-14 ${howInView ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-black text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-400 text-lg">Four steps to get any issue fixed</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: '01', title: 'Spot the issue',    desc: 'See a pothole, broken light, or waste problem in your area.' },
            { num: '02', title: 'Take a photo',      desc: 'Capture it on your phone and drop a pin on the map.'         },
            { num: '03', title: 'Submit to CityFix', desc: 'We route it to the right government department instantly.'    },
            { num: '04', title: 'Track & resolve',   desc: 'Follow the progress publicly until the issue is fixed.'      },
          ].map((step, i) => (
            <div key={i}
              className={`bg-white rounded-2xl p-6 ${howInView ? `animate-fade-up delay-${(i+1)*100}` : 'opacity-0'}`}
              style={{ border: '1px solid #CCFBF1' }}>
              <div className="text-3xl mb-4">{step.emoji}</div>
              <div className="text-4xl font-black mb-3" style={{ color: '#CCFBF1' }}>{step.num}</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={whyRef} style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className={`text-center mb-14 ${whyInView ? 'animate-fade-up' : 'opacity-0'}`}>
            <h2 className="text-4xl font-black text-gray-900 mb-3">Why CityFix?</h2>
            <p className="text-gray-400 text-lg">Built for citizens, not bureaucrats</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Simple reporting',         desc: 'Report any issue in under 60 seconds. No forms, no queues.',               bg: '#F0FDF9', delay: 'delay-100' },
              { title: 'Government accountability', desc: 'Issues are public. Departments are held accountable for every report.',     bg: '#fff0f0', delay: 'delay-200' },
              { title: 'Community driven',          desc: 'Upvote issues that matter. The more votes, the faster the response.',       bg: '#f0fff4', delay: 'delay-300' },
            ].map(({ emoji, title, desc, bg, delay }) => (
              <div key={title}
                className={`rounded-2xl p-8 ${whyInView ? `animate-fade-up ${delay}` : 'opacity-0'}`}
                style={{ background: bg, border: '1px solid #CCFBF1' }}>
                <div className="text-4xl mb-5">{emoji}</div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent issues ── */}
      {issues.length > 0 && (
        <section ref={issuesRef} className="max-w-7xl mx-auto px-6 py-24">
          <div className={`flex items-center justify-between mb-10 ${issuesInView ? 'animate-fade-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-1">Recent issues</h2>
              <p className="text-gray-400">Latest reports from your community</p>
            </div>
            <Link to="/issues"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ color: '#0D9488', background: 'white', border: '2px solid #CCFBF1' }}>
              View all <FiArrowRight size={16}/>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {issues.map((issue, i) => (
              <div key={issue._id}
                className={issuesInView ? `animate-fade-up delay-${(i+1)*100}` : 'opacity-0'}>
                <IssueCard issue={issue}/>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: '#0D9488' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: '#F59E0B', transform: 'translate(30%, -30%)' }}/>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'white', transform: 'translate(-30%, 30%)' }}/>
          <div className="relative z-10">
            <div className="text-5xl mb-4 animate-bounce-slow">🏙️</div>
            <h2 className="text-4xl font-black text-white mb-3">See something that needs fixing?</h2>
            <p className="text-teal-100 text-lg mb-8 max-w-md mx-auto">
              Don't scroll past it. Report it in 60 seconds and make your city better.
            </p>
            <Link to="/report"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:opacity-90"
              style={{ background: 'white', color: '#0D9488' }}>
              Report an issue now <FiArrowRight size={18}/>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}