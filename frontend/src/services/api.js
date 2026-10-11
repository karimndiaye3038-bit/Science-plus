const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const SERVER_URL = API_URL.replace(/\/api\/?$/, '')

const getToken = () => localStorage.getItem('coursplus_token')

// Transforme /uploads/x.mp4 en URL complète du serveur
export function fileUrl(url) {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('blob:')) return url
  return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export async function api(path, options = {}) {
  const token = getToken()
  const isForm = options.body instanceof FormData
  const headers = { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Impossible de joindre le serveur.')
  }

  const data = await response.json().catch(() => ({}))

  // Session expirée : on déconnecte proprement
  if (response.status === 401 && token) {
    window.dispatchEvent(new Event('coursplus:logout'))
  }
  if (!response.ok) throw new Error(data.message || 'Une erreur est survenue.')
  return data
}

// Raccourci pour envoyer du JSON : send('/courses', body) ou send('/courses/1', body, 'PUT')
export const send = (path, body, method = 'POST') =>
  api(path, { method, body: JSON.stringify(body) })

// Envoi de fichier (vidéo, PDF, image) avec progression. Réponse attendue : { url, name }
export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/uploads`)
    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let data = {}
      try { data = JSON.parse(xhr.responseText) } catch { /* réponse vide */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else reject(new Error(data.message || "Échec de l'envoi du fichier."))
    }
    xhr.onerror = () => reject(new Error('Impossible de joindre le serveur.'))

    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}

export { API_URL }
