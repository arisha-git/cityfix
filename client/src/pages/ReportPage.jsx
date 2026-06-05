import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { createIssue } from '../services/api'
import toast from 'react-hot-toast'
import { FiUpload, FiMapPin, FiX, FiArrowRight, FiCamera } from 'react-icons/fi'

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
    click: async ({ latlng: { lat, lng } }) => {
      setPosition({ lat, lng })
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        const d = await r.json()
        setAddress(d.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } catch { setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`) }
    },
  })
  return position ? <Marker position={[position.lat, position.lng]}/> : null
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ title:'', description:'', category:'', sector:'' })
  const [position, setPosition] = useState(null)
  const [address, setAddress]   = useState('')
  const [photos, setPhotos]     = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value, ...(name === 'category' ? { sector: categoryToSector[value] || '' } : {}) })
  }

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 5) return toast.error('Max 5 photos')
    setPhotos([...photos, ...files])
    setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (i) => {
    setPhotos(photos.filter((_,idx) => idx !== i))
    setPreviews(previews.filter((_,idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!form.title)       return toast.error('Title is required')
    if (!form.description) return toast.error('Description is required')
    if (!form.category)    return toast.error('Category is required')
    if (!position)         return toast.error('Please pick a location')
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
    } finally { setLoading(false) }
  }

  const inp = {
    background: '#F0FDF9', border: '2px solid #CCFBF1',
    borderRadius: '14px', padding: '12px 16px',
    fontSize: '14px', width: '100%', outline: 'none',
    color: '#374151', fontFamily: 'Plus Jakarta Sans, sans-serif',
  }

  return (
    <div style={{ background: '#F0FDF9', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-400">Fill in the details and we'll route it to the right department</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Details','Location','Photos'].map((label, i) => {
            const s = i + 1
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                    style={{
                      background: step === s ? '#0D9488' : step > s ? '#F0FDF9' : '#CCFBF1',
                      color: step === s ? 'white' : step > s ? '#0D9488' : '#9ca3af',
                    }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className="text-sm font-bold hidden sm:block"
                    style={{ color: step === s ? '#0D9488' : '#9ca3af' }}>{label}</span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-1 rounded-full mx-2"
                    style={{ background: step > s ? '#0D9488' : '#CCFBF1' }}/>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-3xl p-8" style={{ border: '1px solid #CCFBF1' }}>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-6">Issue details</h2>
              {[
                { name:'title',       label:'Title',       type:'input',    placeholder:'e.g. Large pothole on Main Street' },
                { name:'description', label:'Description', type:'textarea', placeholder:'Describe the issue in detail...'  },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                  {type === 'textarea' ? (
                    <textarea name={name} value={form[name]} onChange={handleChange}
                      placeholder={placeholder} rows={4}
                      style={{ ...inp, resize:'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#0D9488'}
                      onBlur={e => e.target.style.borderColor = '#CCFBF1'}/>
                  ) : (
                    <input name={name} value={form[name]} onChange={handleChange}
                      placeholder={placeholder} style={inp}
                      onFocus={e => e.target.style.borderColor = '#0D9488'}
                      onBlur={e => e.target.style.borderColor = '#CCFBF1'}/>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select name="category" value={form.category} onChange={handleChange} style={inp}
                  onFocus={e => e.target.style.borderColor = '#0D9488'}
                  onBlur={e => e.target.style.borderColor = '#CCFBF1'}>
                  <option value="">Select a category</option>
                  {['roads','electricity','water','sanitation','parks','other'].map(c => (
                    <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                  ))}
                </select>
              </div>
              {form.sector && (
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background:'#F0FDF9' }}>
                  <FiMapPin size={18} style={{ color:'#0D9488' }}/>
                  <div>
                    <p className="text-xs font-bold" style={{ color:'#0D9488' }}>Will be sent to</p>
                    <p className="text-sm font-bold text-gray-700">{form.sector}</p>
                  </div>
                </div>
              )}
              <button onClick={() => {
                if (!form.title || !form.description || !form.category)
                  return toast.error('Please fill all fields')
                setStep(2)
              }} className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                style={{ background:'#0D9488' }}>
                Next: Pick location <FiArrowRight size={18}/>
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-2">Pick a location</h2>
              <p className="text-sm text-gray-400 mb-6">Click anywhere on the map to drop a pin</p>
              <div className="rounded-2xl overflow-hidden" style={{ height:'320px', border:'2px solid #CCFBF1' }}>
                <MapContainer center={[30.3753, 69.3451]} zoom={5}
                  style={{ height:'100%', width:'100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                  <LocationPicker position={position} setPosition={setPosition} setAddress={setAddress}/>
                </MapContainer>
              </div>
              {address && (
                <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background:'#F0FDF9' }}>
                  <FiMapPin size={18} style={{ color:'#0D9488', marginTop:'2px' }}/>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color:'#0D9488' }}>Selected location</p>
                    <p className="text-sm text-gray-700">{address}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm"
                  style={{ background:'white', color:'#0D9488', border:'2px solid #CCFBF1' }}>
                  Back
                </button>
                <button onClick={() => { if (!position) return toast.error('Pick a location'); setStep(3) }}
                  className="flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
                  style={{ background:'#0D9488' }}>
                  Next: Add photos <FiArrowRight size={18}/>
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-2">Add photos</h2>
              <p className="text-sm text-gray-400 mb-6">Add up to 5 photos to help describe the issue</p>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="w-full h-28 object-cover rounded-xl"
                        style={{ border:'2px solid #CCFBF1' }}/>
                      <button onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background:'#e53e3e', color:'white' }}>
                        <FiX size={12}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length < 5 && (
                <label className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer"
                  style={{ border:'2px dashed #5eead4', background:'#F0FDF9', padding:'32px' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background:'#CCFBF1' }}>
                    <FiUpload size={22} style={{ color:'#0D9488' }}/>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">Click to upload photos</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                  <input type="file" accept="image/*" multiple capture="environment"
                    onChange={handlePhotos} className="hidden"/>
                </label>
              )}
              <label className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-sm cursor-pointer"
                style={{ background:'#F0FDF9', color:'#0D9488', border:'2px solid #CCFBF1' }}>
                <FiCamera size={16}/> Take a photo
                <input type="file" accept="image/*" capture="environment"
                  onChange={handlePhotos} className="hidden"/>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm"
                  style={{ background:'white', color:'#0D9488', border:'2px solid #CCFBF1' }}>
                  Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background:'#0D9488' }}>
                  {loading ? 'Submitting...' : <> Submit issue <FiArrowRight size={18}/> </>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}