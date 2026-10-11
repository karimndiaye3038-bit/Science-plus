import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import { Alert, btnClass, Loader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { fileUrl, send } from '../services/api'
import { chapterKey } from '../utils/course'

export default function Learn() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: course, loading, error } = useFetch(`/courses/${id}`, 'course')
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState([])
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (course) setDone((course.completedChapters || []).map(String))
  }, [course])

  if (loading) return <Loader />
  if (error) return <div className="mx-auto max-w-3xl px-5 py-14"><Alert>{error}</Alert></div>
  if (!course) return null

  // Cours payant non acheté : accès refusé
  if (course.enrolled === false && user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-extrabold">Accès réservé</h1>
        <p className="mt-2 text-slate-500">Inscrivez-vous ou achetez ce cours pour y accéder.</p>
        <Link to={`/cours/${id}`} className={`${btnClass('red')} mt-6`}>Voir le cours</Link>
      </div>
    )
  }

  const chapters = course.chapters || []
  const keys = chapters.map(chapterKey)
  const chapter = chapters[current]
  const doneCount = keys.filter(k => done.includes(k)).length
  const percent = chapters.length ? Math.round((doneCount / chapters.length) * 100) : 0
  const isDone = chapter ? done.includes(keys[current]) : false

  async function toggleDone() {
    const key = keys[current]
    const next = !isDone
    setSaving(true)
    setActionError('')
    try {
      const res = await send(`/courses/${id}/progress`, { chapterId: key, done: next })
      setDone(res.completedChapters ? res.completedChapters.map(String) : next ? [...done, key] : done.filter(k => k !== key))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10">
      <Link to="/eleve" className="text-sm font-semibold text-slate-500 hover:text-navy">← Mes cours</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold sm:text-3xl">{course.title}</h1>

      {!chapter ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          Les chapitres seront bientôt disponibles.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="min-w-0 space-y-5">
            <VideoPlayer url={chapter.videoUrl} title={chapter.title} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-xs font-black tracking-widest text-brand-dark">CHAPITRE {current + 1} / {chapters.length}</p>
              <h2 className="mt-1 text-2xl font-extrabold">{chapter.title}</h2>
              {chapter.content && <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">{chapter.content}</p>}

              {chapter.files?.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-bold">Supports à télécharger</h3>
                  <ul className="space-y-2">
                    {chapter.files.map((f, i) => (
                      <li key={i}>
                        <a href={fileUrl(f.url)} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-navy hover:bg-slate-100">
                          📎 {f.name || 'Fichier'} <span className="text-slate-400">⬇</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Alert>{actionError}</Alert>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <button disabled={current === 0} onClick={() => setCurrent(current - 1)} className={btnClass('ghost')}>← Précédent</button>
                {user.role === 'admin' ? <span className="text-xs text-slate-400">Aperçu administrateur</span> : (
                  <button disabled={saving} onClick={toggleDone} className={btnClass(isDone ? 'ghost' : 'navy')}>
                    {isDone ? '✓ Terminé (annuler)' : 'Marquer comme terminé'}
                  </button>
                )}
                <button disabled={current === chapters.length - 1} onClick={() => setCurrent(current + 1)} className={btnClass('red')}>Suivant →</button>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>Progression</span><span>{percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
              </div>
              <ol className="mt-5 space-y-1">
                {chapters.map((c, i) => (
                  <li key={keys[i]}>
                    <button
                      onClick={() => setCurrent(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${i === current ? 'bg-brand-soft/50 font-bold' : 'hover:bg-slate-50'}`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${done.includes(keys[i]) ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {done.includes(keys[i]) ? '✓' : i + 1}
                      </span>
                      <span className="flex-1">{c.title}</span>
                      {c.videoUrl && <span aria-hidden="true">🎬</span>}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
