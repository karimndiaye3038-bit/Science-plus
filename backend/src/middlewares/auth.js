import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null
    if (!token) return res.status(401).json({ message: 'Connexion requise' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'Utilisateur introuvable' })
    next()
  } catch { res.status(401).json({ message: 'Session invalide' }) }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Accès réservé à l’admin' })
  next()
}

// Identifie l'utilisateur s'il est connecté, sans bloquer les visiteurs
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
    }
  } catch { /* jeton invalide : on continue comme visiteur */ }
  next()
}
