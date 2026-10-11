import { Router } from 'express'
import { login, register, updateMe } from '../controllers/authController.js'
import { protect } from '../middlewares/auth.js'
const router = Router()
router.post('/register', register)
router.post('/login', login)
router.put('/me', protect, updateMe)
export default router
