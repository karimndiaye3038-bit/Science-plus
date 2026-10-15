
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  method: {
    type: String,
    enum: ['wave'],
    default: 'wave',
    required: true
  },

  phone: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['en_attente', 'valide', 'refuse'],
    default: 'en_attente'
  },

  waveCheckoutId: {
    type: String,
    default: undefined
  },

  transactionId: {
    type: String,
    default: null
  },

  clientReference: {
    type: String,
    default: null
  }
}, { timestamps: true })

paymentSchema.index(
  { waveCheckoutId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      waveCheckoutId: { $type: 'string' }
    }
  }
)

export default mongoose.model('Payment', paymentSchema)
