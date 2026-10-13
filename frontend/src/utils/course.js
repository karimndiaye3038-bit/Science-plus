export const isPublished = course => course.published !== false
export const chapterKey = (chapter, index) => String(chapter._id || index)
export const countVideos = course => (course.chapters || []).filter(c => c.videoUrl || c.hasVideo).length
export const COURSE_LEVELS = [
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
