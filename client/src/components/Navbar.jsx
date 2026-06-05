import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  FiHome, FiList, FiMap, FiPlusCircle,
  FiUser, FiLogOut, FiMenu, FiX
} from 'react-icons/fi'

const navLinks = [
  { to: '/',       label: 'Home',   icon: FiHome       },
  { to: '/issues', label: 'Issues', icon: FiList       },
  { to: '/map',    label: 'Map',    icon: FiMap        },
  { to: '/report', label: 'Report', icon: FiPlusCircle },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white"
        style={{ borderBottom: '1px solid #ede9ff' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-2xl font-black" style={{ color: '#6C63FF' }}>
            CityFix.
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: isActive(to) ? '#f0efff' : 'transparent',
                  color: isActive(to) ? '#6C63FF' : '#6b7280',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: isActive('/dashboard') ? '#f0efff' : 'transparent',
                    color: isActive('/dashboard') ? '#6C63FF' : '#6b7280',
                  }}
                >
                  <FiUser size={15} />
                  {user.name.split(' ')[0]}
                </Link>

                <Link
                  to="/report"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: '#6C63FF' }}
                >
                  <FiPlusCircle size={15} />
                  Report Issue
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-red-50"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <FiLogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ color: '#6C63FF' }}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: '#6C63FF' }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl"
            style={{ color: '#6C63FF' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-16"
          style={{ background: '#f0efff' }}
        >
          <div className="flex flex-col gap-2 p-6">

            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold transition-all"
                style={{
                  background: isActive(to) ? '#6C63FF' : 'white',
                  color: isActive(to) ? 'white' : '#374151',
                }}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}

            <div className="h-px my-2" style={{ background: '#ede9ff' }} />

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold bg-white"
                  style={{ color: '#374151' }}
                >
                  <FiUser size={20} />
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-bold"
                  style={{ background: '#fff0f3', color: '#e53e3e' }}
                >
                  <FiLogOut size={20} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center px-5 py-4 rounded-2xl text-base font-bold bg-white"
                  style={{ color: '#6C63FF' }}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center px-5 py-4 rounded-2xl text-base font-bold text-white"
                  style={{ background: '#6C63FF' }}
                >
                  Get started
                </Link>
              </>
            )}

          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}