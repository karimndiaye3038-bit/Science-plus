
import { Router } from 'express'

import {
  createPayment,
  listPayments,
  myPayments,
  getMyPaymentStatus,
  updatePayment
} from '../controllers/paymentController.js'

import {
  adminOnly,
  protect
} from '../middlewares/auth.js'

const router = Router()

// Créer une session Wave
router.post('/', protect, createPayment)

// Routes de l'élève connecté
router.get('/me', protect, myPayments)
router.get('/:id/status', protect, getMyPaymentStatus)

// Routes réservées à l'administration
router.get('/', protect, adminOnly, listPayments)
router.patch('/:id', protect, adminOnly, updatePayment)

export default router
