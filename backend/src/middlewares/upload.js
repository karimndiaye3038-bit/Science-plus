import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const here = path.dirname(fileURLToPath(import.meta.url))
export const uploadsDir = path.resolve(here, '../../uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

// Types autorisés (le SVG est volontairement exclu : il peut contenir du code)
const ALLOWED = new Set([
  '.mp4', '.webm', '.mov', '.m4v',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.txt', '.csv'
])

export const MAX_UPLOAD_MB = 500

export const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    // Nom aléatoire : évite les collisions et les noms devinables
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.has(path.extname(file.originalname).toLowerCase())) return cb(null, true)
    cb(new Error('Type de fichier non autorisé.'))
  }
})
