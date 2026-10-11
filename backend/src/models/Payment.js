import mongoose from 'mongoose'

export const METHODS = ['wave', 'orange_money', 'free_money', 'card', 'cash']
export const PHONE_METHODS = ['wave', 'orange_money', 'free_money']

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: METHODS, required: true },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' }
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)
