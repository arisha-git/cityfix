import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

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
    <div className="min-h-screen flex" style={{ background: '#f0efff' }}>

      {/* Left panel — purple, desktop only */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: '#6C63FF' }}
      >
        <div>
          <span className="text-white font-bold text-2xl tracking-tight">CityFix.</span>
        </div>
        <div>
          <h2 className="text-white text-5xl font-black leading-tight mb-4">
            Make Your<br />City Better.
          </h2>
          <p className="text-purple-200 text-lg leading-relaxed">
            Report public issues, track their progress,<br />
            and hold your city accountable.
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-white text-3xl font-black">2.4k+</p>
            <p className="text-purple-200 text-sm">Issues Reported</p>
          </div>
          <div>
            <p className="text-white text-3xl font-black">89%</p>
            <p className="text-purple-200 text-sm">Resolution Rate</p>
          </div>
          <div>
            <p className="text-white text-3xl font-black">12</p>
            <p className="text-purple-200 text-sm">Cities Active</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-400 text-base">Sign in to continue to CityFix</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm focus:outline-none focus:border-purple-400 transition bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm focus:outline-none focus:border-purple-400 transition bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition disabled:opacity-50"
                style={{ background: loading ? '#a89ef5' : '#6C63FF' }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold"
              style={{ color: '#6C63FF' }}
            >
              Create one
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}