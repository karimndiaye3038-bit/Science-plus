import { fileUrl } from '../services/api'

// Reconnaît YouTube, Vimeo ou un fichier vidéo (importé ou lien direct)
export function parseVideo(url) {
  if (!url) return null

  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (youtube) return { type: 'iframe', src: `https://www.youtube.com/embed/${youtube[1]}` }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` }

  return { type: 'file', src: fileUrl(url) }
}
