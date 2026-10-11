import Course, { LEVELS } from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Payment from '../models/Payment.js'

const isObjectId = id => /^[a-f\d]{24}$/i.test(String(id))
const isAdmin = req => req.user?.role === 'admin'

// ---------- Nettoyage des données reçues (jamais de données brutes en base) ----------

// Seuls les fichiers du serveur ou des liens http(s) sont acceptés
const safeUrl = value => {
  const url = String(value || '').trim()
  return /^(\/uploads\/|https?:\/\/)/.test(url) ? url.slice(0, 1000) : ''
}

const cleanFiles = files =>
  (Array.isArray(files) ? files : [])
    .map(f => ({ name: String(f?.name || 'Fichier').trim().slice(0, 200), url: safeUrl(f?.url) }))
    .filter(f => f.url)

const cleanChapters = chapters =>
  (Array.isArray(chapters) ? chapters : []).map(c => {
    const chapter = {
      title: String(c?.title || '').trim().slice(0, 200),
      content: String(c?.content || '').slice(0, 20000),
      videoUrl: safeUrl(c?.videoUrl),
      files: cleanFiles(c?.files)
    }
    if (isObjectId(c?._id)) chapter._id = c._id
    return chapter
  })

// Ne lit que les champs autorisés (ceux présents dans la requête)
function readFields(body = {}) {
  const data = {}
  if ('title' in body) data.title = String(body.title || '').trim().slice(0, 120)
  if ('description' in body) data.description = String(body.description || '').trim()
  if ('category' in body) data.category = String(body.category || '').trim().slice(0, 60)
  if ('level' in body && LEVELS.includes(body.level)) data.level = body.level
  if ('price' in body) {
    const price = Number(body.price)
    data.price = Number.isFinite(price) ? Math.max(0, Math.round(price)) : 0
  }
  if ('published' in body) data.published = Boolean(body.published)
  if ('thumbnail' in body) data.thumbnail = safeUrl(body.thumbnail)
  if ('chapters' in body) data.chapters = cleanChapters(body.chapters)
  return data
}

function validate(data, { creating }) {
  if (creating && (!data.title || !data.description)) return 'Titre et description obligatoires'
  if ('title' in data && !data.title) return 'Le titre ne peut pas être vide'
  if ('description' in data && !data.description) return 'La description ne peut pas être vide'
  if (data.chapters?.some(c => !c.title)) return 'Chaque chapitre doit avoir un titre'
  return null
}

// Version allégée pour les listes : pas de contenu, pas de liens vidéo
const summary = ({ chapters = [], ...course }) => ({
  ...course,
  chaptersCount: chapters.length,
  videosCount: chapters.filter(c => c.videoUrl).length
})

// ---------- Lecture ----------

export async function listCourses(req, res) {
  const admin = isAdmin(req)
  const courses = await Course.find(admin ? {} : { published: { $ne: false } }).sort({ createdAt: -1 }).lean()
  res.json({ courses: admin ? courses : courses.map(summary) })
}

export async function getCourse(req, res) {
  const course = isObjectId(req.params.id) ? await Course.findById(req.params.id).lean() : null
  if (!course || (course.published === false && !isAdmin(req))) {
    return res.status(404).json({ message: 'Cours introuvable' })
  }

  if (isAdmin(req)) return res.json({ course: { ...course, enrolled: true } })

  let enrollment = null
  let paymentStatus
  if (req.user) {
    enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id }).lean()
    if (!enrollment && await Payment.exists({ user: req.user._id, course: course._id, status: 'en_attente' })) {
      paymentStatus = 'en_attente'
    }
  }

  // Inscrit : contenu complet
  if (enrollment) {
    return res.json({ course: { ...course, enrolled: true, completedChapters: enrollment.completedChapters } })
  }

  // Visiteur ou non inscrit : seulement le programme (titres), contenus et vidéos protégés
  res.json({
    course: {
      ...course,
      enrolled: false,
      paymentStatus,
      chapters: course.chapters.map(c => ({
        _id: c._id,
        title: c.title,
        hasVideo: Boolean(c.videoUrl),
        filesCount: c.files?.length || 0
      }))
    }
  })
}

export async function myCourses(req, res) {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate('course').sort({ createdAt: -1 }).lean()

  const courses = enrollments
    .filter(e => e.course)
    .map(e => {
      const ids = new Set((e.course.chapters || []).map(c => String(c._id)))
      const done = (e.completedChapters || []).filter(id => ids.has(id)).length
      return { ...summary(e.course), progress: ids.size ? Math.round((done / ids.size) * 100) : 0 }
    })

  res.json({ courses })
}

// ---------- Administration ----------

export async function createCourse(req, res) {
  const data = readFields(req.body)
  const problem = validate(data, { creating: true })
  if (problem) return res.status(400).json({ message: problem })

  const course = await Course.create({ ...data, author: req.user._id })
  res.status(201).json({ course })
}

export async function updateCourse(req, res) {
  const course = isObjectId(req.params.id) ? await Course.findById(req.params.id) : null
  if (!course) return res.status(404).json({ message: 'Cours introuvable' })

  const data = readFields(req.body)
  const problem = validate(data, { creating: false })
  if (problem) return res.status(400).json({ message: problem })

  Object.assign(course, data)
  await course.save()
  res.json({ course })
}

export async function deleteCourse(req, res) {
  const course = isObjectId(req.params.id) ? await Course.findByIdAndDelete(req.params.id) : null
  if (!course) return res.status(404).json({ message: 'Cours introuvable' })

  // Les paiements sont conservés pour la comptabilité
  await Enrollment.deleteMany({ course: course._id })
  res.json({ message: 'Cours supprimé' })
}

// ---------- Élève ----------

export async function enrollFree(req, res) {
  const course = isObjectId(req.params.id) ? await Course.findById(req.params.id).lean() : null
  if (!course || course.published === false) return res.status(404).json({ message: 'Cours introuvable' })
  if (course.price > 0) return res.status(400).json({ message: 'Ce cours est payant.' })

  await Enrollment.ensure(req.user._id, course._id)
  res.status(201).json({ enrolled: true })
}

export async function saveProgress(req, res) {
  const { chapterId, done } = req.body
  const course = isObjectId(req.params.id) ? await Course.findById(req.params.id).select('chapters').lean() : null
  if (!course) return res.status(404).json({ message: 'Cours introuvable' })

  if (!course.chapters.some(c => String(c._id) === String(chapterId))) {
    return res.status(400).json({ message: 'Chapitre introuvable.' })
  }

  const id = String(chapterId)
  const enrollment = await Enrollment.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    done ? { $addToSet: { completedChapters: id } } : { $pull: { completedChapters: id } },
    { new: true }
  )
  if (!enrollment) return res.status(403).json({ message: 'Vous devez être inscrit à ce cours.' })

  res.json({ completedChapters: enrollment.completedChapters })
}
