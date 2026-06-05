import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      setAuth(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F0FDF9' }}>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative overflow-hidden"
        style={{ background: '#0D9488' }}>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: '#fff' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: '#F59E0B' }} />

        {/* Illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <svg viewBox="0 0 400 350" className="w-full max-w-sm animate-float">
            {/* Sky */}
            <rect width="400" height="350" fill="none"/>
            {/* Ground */}
            <ellipse cx="200" cy="320" rx="180" ry="20" fill="rgba(255,255,255,0.1)"/>
            {/* Buildings */}
            <rect x="30" y="180" width="50" height="130" rx="6" fill="rgba(255,255,255,0.15)"/>
            <rect x="40" y="160" width="30" height="20" rx="3" fill="rgba(255,255,255,0.2)"/>
            <rect x="90" y="140" width="60" height="170" rx="6" fill="rgba(255,255,255,0.2)"/>
            <rect x="100" y="120" width="40" height="20" rx="3" fill="rgba(255,255,255,0.25)"/>
            <rect x="260" y="160" width="55" height="150" rx="6" fill="rgba(255,255,255,0.15)"/>
            <rect x="325" y="190" width="45" height="120" rx="6" fill="rgba(255,255,255,0.18)"/>
            {/* Windows */}
            {[0,1,2].map(r => [0,1].map(c => (
              <rect key={`${r}${c}`} x={44+c*14} y={170+r*20} width="8" height="10" rx="2"
                fill="rgba(255,255,255,0.4)"/>
            )))}
            {[0,1,2,3].map(r => [0,1,2].map(c => (
              <rect key={`b${r}${c}`} x={95+c*14} y={130+r*22} width="8" height="12" rx="2"
                fill="rgba(255,255,255,0.35)"/>
            )))}
            {/* Road */}
            <rect x="160" y="290" width="80" height="20" rx="4" fill="rgba(255,255,255,0.15)"/>
            <rect x="195" y="293" width="10" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
            {/* Person */}
            <circle cx="200" cy="230" r="16" fill="rgba(255,255,255,0.9)"/>
            <rect x="188" y="246" width="24" height="36" rx="8" fill="rgba(255,255,255,0.8)"/>
            <rect x="183" y="252" width="12" height="6" rx="3" fill="rgba(255,255,255,0.6)"/>
            <rect x="205" y="252" width="12" height="6" rx="3" fill="rgba(255,255,255,0.6)"/>
            <rect x="190" y="282" width="9" height="16" rx="4" fill="rgba(255,255,255,0.7)"/>
            <rect x="201" y="282" width="9" height="16" rx="4" fill="rgba(255,255,255,0.7)"/>
            {/* Phone in hand */}
            <rect x="214" y="254" width="10" height="14" rx="3" fill="#F59E0B"/>
            {/* Map pin */}
            <circle cx="200" cy="195" r="10" fill="#F59E0B"/>
            <path d="M200 205 L200 218" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Stars */}
            <text x="60" y="110" fontSize="20" fill="rgba(255,255,255,0.6)" className="animate-bounce-slow">✦</text>
            <text x="300" y="130" fontSize="16" fill="#F59E0B" className="animate-pulse-slow">✦</text>
            <text x="340" y="80" fontSize="12" fill="rgba(255,255,255,0.5)">✦</text>
            {/* Floating card */}
            <rect x="240" y="200" width="110" height="50" rx="12" fill="rgba(255,255,255,0.95)"
              className="animate-float-delay"/>
            <circle cx="262" cy="225" r="12" fill="#CCFBF1"/>
            <text x="255" y="230" fontSize="12">📍</text>
            <rect x="280" y="215" width="55" height="6" rx="3" fill="#0D9488" opacity="0.4"/>
            <rect x="280" y="226" width="38" height="5" rx="2.5" fill="#0D9488" opacity="0.25"/>
          </svg>
        </div>

        <div className="relative z-10">
          <span className="text-white font-black text-3xl">CityFix.</span>
        </div>
        <div className="relative z-10 mt-8">
          <h2 className="text-white text-5xl font-black leading-none mb-4">
            Fix your<br />
            <span style={{ color: '#F59E0B' }}>city</span><br />
            together.
          </h2>
          <p className="text-teal-100 text-base leading-relaxed">
            Report issues, track progress, make change.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 mt-8">
          {[
            { num: '2.4k+', label: 'Issues Reported' },
            { num: '89%',   label: 'Resolved'        },
            { num: '12',    label: 'Cities'          },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 flex-1"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <p className="text-white text-xl font-black">{s.num}</p>
              <p className="text-teal-200 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your CityFix account</p>
          </div>

          <div className="bg-white rounded-3xl p-8"
            style={{ boxShadow: '0 8px 40px rgba(13,148,136,0.10)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { name: 'email',    label: 'Email',    type: 'email',    icon: FiMail, placeholder: 'you@example.com' },
                { name: 'password', label: 'Password', type: 'password', icon: FiLock, placeholder: '••••••••' },
              ].map(({ name, label, type, icon: Icon, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17}/>
                    <input type={type} name={name} value={form[name]}
                      onChange={handleChange} required placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none transition"
                      style={{ background: '#F0FDF9', border: '2px solid #CCFBF1' }}
                      onFocus={e => e.target.style.borderColor = '#0D9488'}
                      onBlur={e => e.target.style.borderColor = '#CCFBF1'}
                    />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: '#0D9488' }}>
                {loading ? 'Signing in...' : <> Sign in <FiArrowRight size={17}/> </>}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: '#CCFBF1' }}/>
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px" style={{ background: '#CCFBF1' }}/>
            </div>

            <div className="rounded-2xl p-4 text-center" style={{ background: '#F0FDF9' }}>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold" style={{ color: '#0D9488' }}>
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}