import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { createIssue } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  FiUpload, FiMapPin, FiX,
  FiArrowRight, FiCamera
} from 'react-icons/fi'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const categoryToSector = {
  roads:       'Roads & Transport Department',
  electricity: 'Electricity & Power Department',
  water:       'Water & Sewerage Department',
  sanitation:  'Sanitation & Waste Management',
  parks:       'Parks & Recreation Department',
  other:       'General Municipal Services',
}

function LocationPicker({ position, setPosition, setAddress }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      setPosition({ lat, lng })
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )
        const data = await res.json()
        setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } catch {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    },
  })
  return position ? <Marker position={[position.lat, position.lng]} /> : null
}

export default function ReportPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    sector:      '',
  })
  const [position, setPosition] = useState(null)
  const [address, setAddress]   = useState('')
  const [photos, setPhotos]     = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'category') {
      setForm({ ...form, category: value, sector: categoryToSector[value] || '' })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 5) {
      toast.error('Max 5 photos allowed')
      return
    }
    setPhotos([...photos, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews([...previews, ...newPreviews])
  }

  const removePhoto = (i) => {
    setPhotos(photos.filter((_, idx) => idx !== i))
    setPreviews(previews.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!form.title)       return toast.error('Title is required')
    if (!form.description) return toast.error('Description is required')
    if (!form.category)    return toast.error('Category is required')
    if (!position)         return toast.error('Please pick a location on the map')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title',       form.title)
      fd.append('description', form.description)
      fd.append('category',    form.category)
      fd.append('sector',      form.sector)
      fd.append('location',    JSON.stringify({ ...position, address }))
      photos.forEach(p => fd.append('photos', p))

      const res = await createIssue(fd)
      toast.success('Issue reported!')
      navigate(`/issues/${res.data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#f7f6ff',
    border: '2px solid #ede9ff',
    borderRadius: '14px',
    padding: '12px 16px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color .2s',
    color: '#374151',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '8px',
  }

  return (
    <div style={{ background: '#f0efff', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-400">Fill in the details and we'll route it to the right department</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Details', 'Location', 'Photos'].map((label, i) => {
            const s = i + 1
            const done = step > s
            const active = step === s
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
                    style={{
                      background: active ? '#6C63FF' : done ? '#f0efff' : '#ede9ff',
                      color: active ? 'white' : done ? '#6C63FF' : '#9ca3af',
                    }}
                  >
                    {done ? '✓' : s}
                  </div>
                  <span
                    className="text-sm font-bold hidden sm:block"
                    style={{ color: active ? '#6C63FF' : '#9ca3af' }}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="flex-1 h-1 rounded-full mx-2"
                    style={{ background: step > s ? '#6C63FF' : '#ede9ff' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-3xl p-8"
          style={{ border: '1px solid #ede9ff' }}
        >

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">Issue details</h2>

              <div>
                <label style={labelStyle}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Large pothole on Main Street"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = '#ede9ff'}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = '#ede9ff'}
                />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = '#ede9ff'}
                >
                  <option value="">Select a category</option>
                  <option value="roads">Roads</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="parks">Parks</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {form.sector && (
                <div
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: '#f0efff' }}
                >
                  <FiMapPin size={18} style={{ color: '#6C63FF' }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#6C63FF' }}>
                      Will be sent to
                    </p>
                    <p className="text-sm font-bold text-gray-700">{form.sector}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!form.title || !form.description || !form.category)
                    return toast.error('Please fill all fields')
                  setStep(2)
                }}
                className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background: '#6C63FF' }}
              >
                Next: Pick location <FiArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-2">Pick a location</h2>
              <p className="text-sm text-gray-400 mb-6">
                Click anywhere on the map to drop a pin
              </p>

              <div className="rounded-2xl overflow-hidden" style={{ height: '320px', border: '2px solid #ede9ff' }}>
                <MapContainer
                  center={[30.3753, 69.3451]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap"
                  />
                  <LocationPicker
                    position={position}
                    setPosition={setPosition}
                    setAddress={setAddress}
                  />
                </MapContainer>
              </div>

              {address && (
                <div
                  className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: '#f0efff' }}
                >
                  <FiMapPin size={18} style={{ color: '#6C63FF', marginTop: '2px' }} />
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: '#6C63FF' }}>
                      Selected location
                    </p>
                    <p className="text-sm text-gray-700">{address}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm"
                  style={{
                    background: 'white',
                    color: '#6C63FF',
                    border: '2px solid #ede9ff',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!position) return toast.error('Please pick a location')
                    setStep(3)
                  }}
                  className="flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                  style={{ background: '#6C63FF' }}
                >
                  Next: Add photos <FiArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Photos */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-2">Add photos</h2>
              <p className="text-sm text-gray-400 mb-6">
                Add up to 5 photos. This helps the department understand the issue better.
              </p>

              {/* Photo previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt=""
                        className="w-full h-28 object-cover rounded-xl"
                        style={{ border: '2px solid #ede9ff' }}
                      />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: '#e53e3e', color: 'white' }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              {photos.length < 5 && (
                <label
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all"
                  style={{
                    border: '2px dashed #c4b5fd',
                    background: '#f7f6ff',
                    padding: '32px',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: '#ede9ff' }}
                  >
                    <FiUpload size={22} style={{ color: '#6C63FF' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">
                      Click to upload photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP up to 10MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotos}
                    className="hidden"
                  />
                </label>
              )}

              {/* Camera button for mobile */}
              <label
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all"
                style={{
                  background: '#f0efff',
                  color: '#6C63FF',
                  border: '2px solid #ede9ff',
                }}
              >
                <FiCamera size={16} />
                Take a photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotos}
                  className="hidden"
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm"
                  style={{
                    background: 'white',
                    color: '#6C63FF',
                    border: '2px solid #ede9ff',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: '#6C63FF' }}
                >
                  {loading ? 'Submitting...' : 'Submit issue'}
                  {!loading && <FiArrowRight size={18} />}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  )
}