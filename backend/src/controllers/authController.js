import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function tokenFor(user) { return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }) }

export async function register(req, res) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Tous les champs sont obligatoires' })
    if (password.length < 6) return res.status(400).json({ message: 'Le mot de passe doit avoir 6 caractères minimum' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Cet email existe déjà' })
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: 'eleve' })
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch { res.status(500).json({ message: 'Erreur serveur' }) }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email ou mot de passe incorrect' })
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch { res.status(500).json({ message: 'Erreur serveur' }) }
}

export async function updateMe(req, res) {
  const { name, password } = req.body
  const user = await User.findById(req.user._id)

  if (name !== undefined) {
    const clean = String(name).trim().slice(0, 100)
    if (!clean) return res.status(400).json({ message: 'Le nom ne peut pas être vide' })
    user.name = clean
  }
  if (password) {
    if (String(password).length < 6) return res.status(400).json({ message: 'Le mot de passe doit avoir 6 caractères minimum' })
    user.password = await bcrypt.hash(String(password), 10)
  }

  await user.save()
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
}
