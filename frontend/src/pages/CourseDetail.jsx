import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'
import { Alert, btnClass, Loader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { send } from '../services/api'
import { price } from '../utils/format'
import { countVideos } from '../utils/course'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: course, loading, error, reload } = useFetch(`/courses/${id}`, 'course')
  const [paying, setPaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  if (loading) return <Loader />
  if (error) return <div className="mx-auto max-w-3xl px-5 py-14"><Alert>{error}</Alert></div>
  if (!course) return null

  const chapters = course.chapters || []
  const isFree = !(Number(course.price) > 0)
  const isAdmin = user?.role === 'admin'
  const pending = course.paymentStatus === 'en_attente'

  async function enrollFree() {
    setBusy(true)
    setActionError('')
    try {
      await send(`/courses/${id}/enroll`, {})
      navigate(`/cours/${id}/apprendre`)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function action() {
    if (!user) {
      return <Link to="/connexion" state={{ from: `/cours/${id}` }} className={`${btnClass('red')} w-full`}>Se connecter pour s’inscrire</Link>
    }
    if (isAdmin) {
      return <Link to={`/admin/cours/${id}`} className={`${btnClass('navy')} w-full`}>Modifier ce cours</Link>
    }
    if (course.enrolled) {
      return <Link to={`/cours/${id}/apprendre`} className={`${btnClass('red')} w-full`}>Continuer le cours →</Link>
    }
    if (pending) {
      return <p className="rounded-xl bg-amber-50 p-4 text-center text-sm font-semibold text-amber-700">⏳ Paiement en attente de validation</p>
    }
    if (isFree) {
      return <button onClick={enrollFree} disabled={busy} className={`${btnClass('red')} w-full`}>{busy ? 'Inscription...' : 'S’inscrire gratuitement'}</button>
    }
    return <button onClick={() => setPaying(true)} className={`${btnClass('red')} w-full`}>Acheter ce cours</button>
  }

  return (
    <div>
      <section className="bg-navy px-5 py-14 text-white">
        <div className="mx-auto max-w-[1200px]">
          <Link to="/cours" className="text-sm text-slate-300 hover:text-white">← Tous les cours</Link>
          <p className="mt-6 text-sm font-black tracking-widest text-brand">{(course.category || 'COURS').toUpperCase()}</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">{course.description}</p>
          <p className="mt-5 text-sm text-slate-300">
            {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
            {countVideos(course) > 0 && ` · ${countVideos(course)} vidéo${countVideos(course) > 1 ? 's' : ''}`}
            {course.level && ` · Niveau ${course.level.toLowerCase()}`}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="mb-4 text-2xl font-extrabold">Programme du cours</h2>
          {chapters.length ? (
            <ol className="space-y-3">
              {chapters.map((chapter, i) => (
                <li key={chapter._id || i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-black text-brand-dark">{i + 1}</span>
                  <span className="flex-1 font-bold">{chapter.title}</span>
                  <span className="shrink-0 text-sm text-slate-500">
                    {(chapter.videoUrl || chapter.hasVideo) && '🎬 '}
                    {(chapter.filesCount ?? chapter.files?.length ?? 0) > 0 && `📎 ${chapter.filesCount ?? chapter.files.length}`}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Les chapitres seront bientôt disponibles.
            </div>
          )}
        </section>

        <aside>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-3xl font-extrabold text-brand-dark">{price(course.price)}</p>
            <Alert>{actionError}</Alert>
            {action()}
            <ul className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <li>🎬 Cours en vidéo</li>
              <li>📎 Supports à télécharger</li>
              <li>📈 Suivi de progression</li>
              <li>♾️ Accès illimité</li>
            </ul>
          </div>
        </aside>
      </div>

      {paying && <PaymentModal course={course} onClose={() => setPaying(false)} onDone={reload} />}
    </div>
  )
}
