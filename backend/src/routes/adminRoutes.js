import { Router } from 'express'
import User from '../models/User.js'
import Course from '../models/Course.js'
import { protect, adminOnly } from '../middlewares/auth.js'
const router = Router()
router.get('/overview', protect, adminOnly, async (req, res) => {
  const [courses, students] = await Promise.all([Course.find().sort({ createdAt: -1 }), User.countDocuments({ role: 'eleve' })])
  res.json({ courses, students })
})
export default router
