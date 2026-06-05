import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getIssues } from '../services/api'
import { FiMapPin, FiArrowRight, FiArrowUp, FiFilter } from 'react-icons/fi'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const categoryConfig = {
  roads:       { color: '#f97316', emoji: '🛣️',  label: 'Roads'       },
  electricity: { color: '#eab308', emoji: '⚡',   label: 'Electricity' },
  water:       { color: '#3b82f6', emoji: '💧',   label: 'Water'       },
  sanitation:  { color: '#22c55e', emoji: '🗑️',  label: 'Sanitation'  },
  parks:       { color: '#0D9488', emoji: '🌳',   label: 'Parks'       },
  other:       { color: '#8b5cf6', emoji: '📌',   label: 'Other'       },
}

const statusColors = {
  open:          { bg: '#fff0f0', color: '#e53e3e' },
  'in-progress': { bg: '#fffbeb', color: '#d97706' },
  resolved:      { bg: '#f0fff4', color: '#38a169' },
}

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

export default function MapPage() {
  const navigate = useNavigate()
  const [issues, setIssues]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActive] = useState('')
  const [sidebarOpen, setSidebar]   = useState(true)

  useEffect(() => {
    getIssues()
      .then(res => setIssues(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory
    ? issues.filter(i => i.category === activeCategory)
    : issues

  const withLocation = filtered.filter(i => i.location?.lat && i.location?.lng)

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-1">Issues Map</h1>
            <p className="text-gray-400">
              {loading ? 'Loading...' : `${withLocation.length} issue${withLocation.length !== 1 ? 's' : ''} on the map`}
            </p>
          </div>
          <button
            onClick={() => setSidebar(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold md:hidden"
            style={{ background: 'white', color: '#0D9488', border: '1px solid #CCFBF1' }}
          >
            <FiFilter size={15}/> Filters
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActive('')}
            className="px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              background: !activeCategory ? '#0D9488' : 'white',
              color: !activeCategory ? 'white' : '#6b7280',
              border: '1px solid #CCFBF1',
            }}
          >
            All ({issues.length})
          </button>
          {Object.entries(categoryConfig).map(([key, { emoji, label, color }]) => {
            const count = issues.filter(i => i.category === key).length
            if (count === 0) return null
            return (
              <button
                key={key}
                onClick={() => setActive(activeCategory === key ? '' : key)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={{
                  background: activeCategory === key ? color : 'white',
                  color: activeCategory === key ? 'white' : '#6b7280',
                  border: '1px solid #CCFBF1',
                }}
              >
                {emoji} {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Map + sidebar */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex gap-6">

          {/* Map */}
          <div className="flex-1 rounded-3xl overflow-hidden"
            style={{ height: '600px', border: '2px solid #CCFBF1' }}>
            {loading ? (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: '#F0FDF9' }}>
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-bounce-slow">🗺️</div>
                  <p className="text-gray-400 font-bold">Loading map...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[30.3753, 69.3451]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap"
                />
                {withLocation.map(issue => {
                  const cat = categoryConfig[issue.category] || categoryConfig.other
                  const sta = statusColors[issue.status]     || statusColors.open
                  return (
                    <Marker
                      key={issue._id}
                      position={[issue.location.lat, issue.location.lng]}
                      icon={createColoredIcon(cat.color)}
                    >
                      <Popup maxWidth={280}>
                        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: '220px' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{
                              background: cat.color + '20',
                              color: cat.color,
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'capitalize',
                            }}>
                              {cat.emoji} {issue.category}
                            </span>
                            <span style={{
                              background: sta.bg,
                              color: sta.color,
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'capitalize',
                            }}>
                              {issue.status}
                            </span>
                          </div>
                          <p style={{ fontWeight: '800', fontSize: '14px', margin: '0 0 6px', color: '#0f172a' }}>
                            {issue.title}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px', lineHeight: '1.5' }}>
                            {issue.description?.slice(0, 80)}
                            {issue.description?.length > 80 ? '...' : ''}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              👍 {issue.upvotes?.length || 0} upvotes
                            </span>
                            <button
                              onClick={() => navigate(`/issues/${issue._id}`)}
                              style={{
                                background: '#0D9488',
                                color: 'white',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '10px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                              }}
                            >
                              View issue →
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            )}
          </div>

          {/* Sidebar — issue list */}
          <div
            className="hidden md:flex flex-col gap-3"
            style={{ width: '300px', maxHeight: '600px', overflowY: 'auto' }}
          >
            {withLocation.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center"
                style={{ border: '1px solid #CCFBF1' }}>
                <div className="text-3xl mb-3">🗺️</div>
                <p className="font-black text-gray-900 text-sm mb-1">No issues on map</p>
                <p className="text-gray-400 text-xs">
                  {activeCategory ? 'Try a different filter' : 'No issues have locations yet'}
                </p>
              </div>
            ) : (
              withLocation.map(issue => {
                const cat = categoryConfig[issue.category] || categoryConfig.other
                const sta = statusColors[issue.status]     || statusColors.open
                return (
                  <button
                    key={issue._id}
                    onClick={() => navigate(`/issues/${issue._id}`)}
                    className="bg-white rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 w-full"
                    style={{ border: '1px solid #CCFBF1' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: cat.color + '20', color: cat.color }}
                      >
                        {cat.emoji} {issue.category}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: sta.bg, color: sta.color }}
                      >
                        {issue.status}
                      </span>
                    </div>
                    <p className="font-black text-gray-900 text-sm mb-1 text-left line-clamp-1">
                      {issue.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiMapPin size={11}/>
                        <span className="truncate max-w-[160px]">
                          {issue.location.address?.split(',')[0] || 'No address'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiArrowUp size={11}/>
                        {issue.upvotes?.length || 0}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #CCFBF1' }}>
          <h3 className="text-sm font-black text-gray-900 mb-4">Map legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(categoryConfig).map(([key, { color, emoji, label }]) => (
              <div key={key} className="flex items-center gap-2">
                <div style={{
                  width: '16px', height: '16px',
                  background: color,
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  border: '2px solid white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}/>
                <span className="text-sm font-bold text-gray-600">{emoji} {label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}