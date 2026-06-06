import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await register({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      })
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      if (res.data.user.role === 'official') navigate('/official')
      else navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name',            label: 'Full name',        type: 'text',     icon: FiUser, placeholder: 'Your name'            },
    { name: 'email',           label: 'Email address',    type: 'email',    icon: FiMail, placeholder: 'you@example.com'       },
    { name: 'password',        label: 'Password',         type: 'password', icon: FiLock, placeholder: 'At least 6 characters' },
    { name: 'confirmPassword', label: 'Confirm password', type: 'password', icon: FiLock, placeholder: '••••••••'              },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: '#F0FDF9' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black" style={{ color: '#0D9488' }}>
            CityFix.
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mt-6 mb-2">Create account</h1>
          <p className="text-gray-400">Join thousands fixing their cities</p>
        </div>

        <div className="bg-white rounded-3xl p-8"
          style={{ boxShadow: '0 8px 40px rgba(13,148,136,0.10)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: 'citizen',
                    label: '👤 Citizen',
                    desc:  'Report issues in my city',
                  },
                  {
                    value: 'official',
                    label: '🏛️ Gov. Official',
                    desc:  'Manage and resolve issues',
                  },
                ].map(({ value, label, desc }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setForm({ ...form, role: value })}
                    className="p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: form.role === value ? '#F0FDF9' : 'white',
                      border: form.role === value
                        ? '2px solid #0D9488'
                        : '2px solid #CCFBF1',
                    }}
                  >
                    <p className="text-sm font-black text-gray-900 mb-1">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Input fields */}
            {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17}/>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none transition"
                    style={{ background: '#F0FDF9', border: '2px solid #CCFBF1' }}
                    onFocus={e => e.target.style.borderColor = '#0D9488'}
                    onBlur={e => e.target.style.borderColor = '#CCFBF1'}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#0D9488' }}
            >
              {loading ? 'Creating account...' : <> Create account <FiArrowRight size={17}/> </>}
            </button>

          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: '#CCFBF1' }}/>
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: '#CCFBF1' }}/>
          </div>

          <div className="rounded-2xl p-4 text-center" style={{ background: '#F0FDF9' }}>
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#0D9488' }}>
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}