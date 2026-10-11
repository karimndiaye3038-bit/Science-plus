import { useRef, useState } from 'react'
import { uploadFile } from '../services/api'
import { btnClass } from './ui'

// Bouton d'import avec barre de progression. onUploaded({ url, name })
export default function UploadField({ accept, label = 'Importer un fichier', onUploaded }) {
  const inputRef = useRef(null)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  async function pick(e) {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    setError('')
    setProgress(0)
    try {
      const res = await uploadFile(file, setProgress)
      onUploaded({ url: res.url, name: res.name || file.name })
    } catch (err) {
      setError(err.message)
    } finally {
      setProgress(null)
      input.value = ''
    }
  }

  const busy = progress !== null

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} onChange={pick} className="hidden" />
      <button type="button" disabled={busy} onClick={() => inputRef.current.click()} className={btnClass('ghost', 'sm')}>
        {busy ? `Envoi... ${progress}%` : `⬆ ${label}`}
      </button>
      {busy && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
