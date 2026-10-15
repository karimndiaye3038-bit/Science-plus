
import mongoose from 'mongoose'

export const LEVELS = [
  'Sixième',
  'Cinquième',
  'Quatrième',
  'Troisième',
  'Seconde L',
  'Seconde S',
  'Première L1',
  'Première L2',
  'Première S1',
  'Première S2',
  'Terminale L1',
  'Terminale L2',
  'Terminale S1',
  'Terminale S2'
]

const fileSchema = new mongoose.Schema({
  name: { type: String, default: 'Fichier' },
  url: { type: String, required: true }
}, { _id: false })

// Une grande partie à l'intérieur d'un chapitre
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  files: [fileSchema]
})

// Un chapitre contient plusieurs grandes parties
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  files: [fileSchema],
  sections: [sectionSchema]
})

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, default: '', trim: true },
  level: { type: String, enum: LEVELS, default: 'Sixième' },
  price: { type: Number, default: 0, min: 0 },
  published: { type: Boolean, default: true },
  thumbnail: { type: String, default: '' },
  chapters: [chapterSchema],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default mongoose.model('Course', courseSchema)
