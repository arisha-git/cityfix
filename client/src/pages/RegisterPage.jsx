import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await register({
        name: form.name,
        email: form.email,
        password: form.password
      })
      setAuth(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: '#f0efff' }}>
      <div className="w-full max-w-md">

        <div className="mb-10">
          <Link to="/" className="text-2xl font-black" style={{ color: '#6C63FF' }}>
            CityFix.
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mt-6 mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-base">
            Join thousands reporting issues around you
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm focus:outline-none focus:border-purple-400 transition bg-gray-50"
              />
            </div>

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
                placeholder="At least 6 characters"
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm focus:outline-none focus:border-purple-400 transition bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold"
            style={{ color: '#6C63FF' }}
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}