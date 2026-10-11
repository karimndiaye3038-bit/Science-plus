import mongoose from 'mongoose'

export const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']

const fileSchema = new mongoose.Schema({
  name: { type: String, default: 'Fichier' },
  url: { type: String, required: true }
}, { _id: false })

// Les chapitres gardent leur _id : la progression des élèves s'appuie dessus
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  files: [fileSchema]
})

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, default: '', trim: true },
  level: { type: String, enum: LEVELS, default: 'Débutant' },
  price: { type: Number, default: 0, min: 0 },
  published: { type: Boolean, default: true },
  thumbnail: { type: String, default: '' },
  chapters: [chapterSchema],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default mongoose.model('Course', courseSchema)
