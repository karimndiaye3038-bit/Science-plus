
import mongoose from 'mongoose'
import Course from '../models/Course.js'
import Payment from '../models/Payment.js'

export async function requireCourseAccess(req, res, next) {
  try {
    const courseId = req.params.courseId || req.params.id

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        message: 'Identifiant du cours invalide.'
      })
    }

    const course = await Course.findOne({
      _id: courseId,
      published: true
    })

    if (!course) {
      return res.status(404).json({
        message: 'Cours introuvable ou non publié.'
      })
    }

    // Un cours à zéro FCFA est accessible gratuitement.
    if (course.price === 0) {
      req.course = course
      return next()
    }

    // Pour un cours payant, vérifier un paiement confirmé
    // appartenant à l'utilisateur connecté.
    const payment = await Payment.findOne({
      user: req.user._id,
      course: course._id,
      status: 'valide'
    })

    if (!payment) {
      return res.status(403).json({
        message: 'Tu dois payer ce cours pour y accéder.'
      })
    }

    req.course = course
    next()
  } catch (error) {
    console.error('Contrôle accès cours:', error.message)

    return res.status(500).json({
      message: 'Impossible de vérifier les droits d’accès.'
    })
  }
}
