import { Router } from 'express'
import User from '../models/User.js'
import Enrollment from '../models/Enrollment.js'
import { adminOnly, protect } from '../middlewares/auth.js'
const router = Router()

router.get('/', protect, adminOnly, async (req, res) => {
  const [students, counts] = await Promise.all([
    User.find({ role: 'eleve' }).select('-password').sort({ createdAt: -1 }),
    Enrollment.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }])
  ])
  const byUser = new Map(counts.map(c => [String(c._id), c.count]))
  res.json({
    students: students.map(s => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      createdAt: s.createdAt,
      coursesCount: byUser.get(String(s._id)) || 0
    }))
  })
})

export default router
