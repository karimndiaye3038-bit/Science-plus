import { Link } from 'react-router-dom'
import { fileUrl } from '../services/api'
import { price } from '../utils/format'
import { countVideos } from '../utils/course'
import { btnClass } from './ui'

// progress (0-100) est optionnel : affiché dans l'espace élève
export default function CourseCard({ course, to, cta = 'Voir le cours', progress }) {
  const chapters = course.chapters?.length ?? course.chaptersCount ?? 0
  const videos = course.chapters ? countVideos(course) : course.videosCount ?? 0

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative grid h-36 place-items-center bg-linear-to-br from-navy to-navy-soft text-5xl">
        {course.thumbnail ? (
          <img src={fileUrl(course.thumbnail)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          '📚'
        )}
        {course.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-navy">
            {course.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-lg font-extrabold leading-snug">{course.title}</h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">{course.description}</p>

        <p className="mt-3 text-xs text-slate-500">
          {chapters} chapitre{chapters > 1 ? 's' : ''}
          {videos > 0 && ` · ${videos} vidéo${videos > 1 ? 's' : ''}`}
          {course.level && ` · ${course.level}`}
        </p>

        {progress !== undefined && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs font-bold">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-extrabold text-brand-dark">{price(course.price)}</span>
          <Link to={to} className={btnClass('red', 'sm')}>{cta}</Link>
        </div>
      </div>
    </article>
  )
}
