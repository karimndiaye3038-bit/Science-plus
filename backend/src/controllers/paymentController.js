import mongoose from 'mongoose'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Payment, { METHODS, PHONE_METHODS } from '../models/Payment.js'

const INSTRUCTIONS =
  process.env.PAYMENT_INSTRUCTIONS || 'Le professeur vous contactera pour confirmer votre paiement.'

export async function createPayment(req, res) {
  const { courseId, method } = req.body
  const phone = String(req.body.phone || '').trim()

  if (!METHODS.includes(method)) return res.status(400).json({ message: 'Mode de paiement invalide.' })
  if (PHONE_METHODS.includes(method) && !/^[0-9 +]{9,16}$/.test(phone)) {
    return res.status(400).json({ message: 'Numéro de téléphone invalide.' })
  }

  const course = mongoose.isValidObjectId(courseId) ? await Course.findById(courseId) : null
  if (!course || course.published === false) return res.status(404).json({ message: 'Cours introuvable.' })
  if (!(course.price > 0)) return res.status(400).json({ message: 'Ce cours est gratuit : inscrivez-vous directement.' })

  if (await Enrollment.findOne({ user: req.user._id, course: course._id })) {
    return res.status(400).json({ message: 'Vous avez déjà accès à ce cours.' })
  }
  if (await Payment.findOne({ user: req.user._id, course: course._id, status: 'en_attente' })) {
    return res.status(400).json({ message: 'Un paiement est déjà en attente pour ce cours.' })
  }

  // Le montant vient toujours du serveur, jamais du navigateur
  const payment = await Payment.create({
    user: req.user._id,
    course: course._id,
    amount: course.price,
    method,
    phone: PHONE_METHODS.includes(method) ? phone : ''
  })

  res.status(201).json({ payment, instructions: INSTRUCTIONS })
}

export async function myPayments(req, res) {
  const payments = await Payment.find({ user: req.user._id }).populate('course', 'title').sort({ createdAt: -1 })
  res.json({ payments })
}

export async function listPayments(req, res) {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('course', 'title')
    .sort({ createdAt: -1 })
  res.json({ payments })
}

// L'admin valide ou refuse un paiement en attente ; la validation inscrit l'élève
export async function updatePayment(req, res) {
  const { status } = req.body
  if (!['valide', 'refuse'].includes(status)) return res.status(400).json({ message: 'Statut invalide.' })

  const payment = mongoose.isValidObjectId(req.params.id) ? await Payment.findById(req.params.id) : null
  if (!payment) return res.status(404).json({ message: 'Paiement introuvable.' })
  if (payment.status !== 'en_attente') return res.status(400).json({ message: 'Ce paiement a déjà été traité.' })

  payment.status = status
  await payment.save()
  if (status === 'valide') await Enrollment.ensure(payment.user, payment.course)

  await payment.populate([{ path: 'user', select: 'name email' }, { path: 'course', select: 'title' }])
  res.json({ payment })
}
