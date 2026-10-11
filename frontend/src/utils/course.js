export const isPublished = course => course.published !== false
export const chapterKey = (chapter, index) => String(chapter._id || index)
export const countVideos = course => (course.chapters || []).filter(c => c.videoUrl || c.hasVideo).length
export const COURSE_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé']
