import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'

import { waveWebhook } from './controllers/waveWebhookController.js'

import connectDB from './config/db.js'
import User from './models/User.js'

import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import { uploadsDir, MAX_UPLOAD_MB } from './middlewares/upload.js'

const app = express()

app.get("/", (req, res) => {
  res.json({
    message: "Bienvenue sur l'API Science Plus",
    status: "Serveur opérationnel"
  });
});

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
'  https://science-plus-six.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans origin
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(
        new Error(`Origine CORS non autorisée : ${origin}`)
      )
    },
    credentials: true
  })
)

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json())

// ==========================================
// ROUTE DE TEST
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    message: 'CoursPlus API fonctionne'
  })
})

// ==========================================
// ROUTES
// ==========================================

app.use('/api/auth', authRoutes)

app.use('/api/courses', courseRoutes)

app.use('/api/admin', adminRoutes)
app.post(
  '/api/payments/wave/webhook',
  express.raw({ type: 'application/json' }),
  waveWebhook
)
app.use('/api/payments', paymentRoutes)

app.use('/api/students', studentRoutes)

app.use('/api/uploads', uploadRoutes)

// Fichiers importés (vidéos, PDF, images) : lecture par morceaux (Range) gérée par express.static
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }))

// ==========================================
// ERREURS
// ==========================================

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route introuvable' })
})

// Express 5 transmet ici les erreurs des fonctions async
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: `Fichier trop volumineux (max ${MAX_UPLOAD_MB} Mo).` })
  }
  if (error.name === 'MulterError' || error.message === 'Type de fichier non autorisé.') {
    return res.status(400).json({ message: error.message })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Données invalides.' })
  }
  if (error.message?.startsWith('Origine CORS')) {
    return res.status(403).json({ message: error.message })
  }
  console.error(error)
  res.status(500).json({ message: 'Erreur serveur' })
})
// ==========================================
// CRÉATION DU COMPTE ADMIN
// ==========================================

async function seedAdmin() {
  try {
    const email =
      process.env.ADMIN_EMAIL ||
      'admin@coursplus.com'

    const password =
      process.env.ADMIN_PASSWORD ||
      'admin123'

    const exists = await User.findOne({ email })

    if (exists) {
      console.log('Compte admin déjà présent')
      return
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    )

    await User.create({
      name: 'Professeur',
      email,
      password: hashedPassword,
      role: 'admin'
    })

    console.log(
      `Admin créé : ${email} / ${password}`
    )
  } catch (error) {
    console.error(
      'Erreur création admin :',
      error.message
    )
  }
}

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================

const port = process.env.PORT || 5000

async function startServer() {
  try {
    await connectDB()

    await seedAdmin()

    app.listen(port, () => {
      console.log(
        `CoursPlus API : http://localhost:${port}`
      )
    })
  } catch (error) {
    console.error(
      'Erreur démarrage serveur :',
      error.message
    )

    process.exit(1)
  }
}

startServer()