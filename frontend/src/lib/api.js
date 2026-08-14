import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export const api = axios.create({ baseURL: API_BASE })

export async function analyzeFrame(imageBlob) {
  const formData = new FormData()
  formData.append('file', imageBlob, 'frame.jpg')
  const res = await api.post('/analyze-frame', formData)
  return res.data
}

export async function getTrend() {
  const res = await api.get('/trend')
  return res.data
}
