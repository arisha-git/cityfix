import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

export const login         = (data) => api.post('/auth/login', data)
export const register      = (data) => api.post('/auth/register', data)
export const getIssues     = (params) => api.get('/issues', { params })
export const getIssue      = (id) => api.get('/issues/' + id)
export const createIssue   = (data) => api.post('/issues', data)
export const upvoteIssue   = (id) => api.post(`/issues/${id}/upvote`)
export const updateStatus  = (id, status) => api.patch('/issues/' + id, { status })
export const getComments   = (id) => api.get(`/issues/${id}/comments`)
export const addComment    = (id, body) => api.post(`/issues/${id}/comments`, { body })

export default api