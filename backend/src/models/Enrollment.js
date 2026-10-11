import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedChapters: [String]
}, { timestamps: true })

// Un élève ne peut être inscrit qu'une fois à un cours
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

// Inscrit l'élève s'il ne l'est pas déjà
enrollmentSchema.statics.ensure = async function (user, course) {
  const existing = await this.findOne({ user, course })
  if (existing) return existing
  try {
    return await this.create({ user, course })
  } catch (error) {
    if (error.code === 11000) return this.findOne({ user, course })
    throw error
  }
}

export default mongoose.model('Enrollment', enrollmentSchema)
