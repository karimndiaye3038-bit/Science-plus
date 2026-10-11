import { Router } from 'express'
import { adminOnly, protect } from '../middlewares/auth.js'
import { upload } from '../middlewares/upload.js'
const router = Router()

router.post('/', protect, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu.' })
  // multer lit les noms en latin1 : on remet les accents correctement
  const name = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
  res.status(201).json({ url: `/uploads/${req.file.filename}`, name })
})

export default router
