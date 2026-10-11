import { Router } from 'express'
import { createPayment, listPayments, myPayments, updatePayment } from '../controllers/paymentController.js'
import { adminOnly, protect } from '../middlewares/auth.js'
const router = Router()

router.post('/', protect, createPayment)
router.get('/me', protect, myPayments)              // avant /:id
router.get('/', protect, adminOnly, listPayments)
router.patch('/:id', protect, adminOnly, updatePayment)

export default router
