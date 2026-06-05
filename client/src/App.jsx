import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from "./store/authStore";
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/IssueDetailPage'
import ReportPage from './pages/ReportPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import AdminPage from './pages/AdminPage'
import OfficialPage from './pages/OfficialPage'

function Protected({ children, roles }) {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role))
    return <Navigate to="/" />

  return children
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/report"
          element={
            <Protected roles={['citizen', 'admin']}>
              <ReportPage />
            </Protected>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Protected roles={['citizen']}>
              <DashboardPage />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected roles={['admin']}>
              <AdminPage />
            </Protected>
          }
        />

        <Route
          path="/official"
          element={
            <Protected roles={['official']}>
              <OfficialPage />
            </Protected>
          }
        />
      </Routes>
    </>
  )
}