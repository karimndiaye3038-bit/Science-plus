import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import UploadField from '../../components/UploadField'
import { Alert, btnClass, Card, Field, inputClass, Loader, PageHeader } from '../../components/ui'
import { api, fileUrl, send } from '../../services/api'
import { COURSE_LEVELS } from '../../utils/course'

const uid = () => Math.random().toString(36).slice(2, 10)
const newChapter = () => ({ _uid: uid(), title: '', content: '', videoUrl: '', files: [] })
const emptyCourse = { title: '', description: '', category: '', level: 'Débutant', price: 0, published: true, thumbnail: '', chapters: [] }

export default function CourseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)

  const [form, setForm] = useState(emptyCourse)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!editing) return
    api(`/courses/${id}`)
      .then(({ course }) =>
        setForm({
          ...emptyCourse,
          ...course,
          price: course.price || 0,
          published: course.published !== false,
          chapters: (course.chapters || []).map(c => ({ files: [], videoUrl: '', ...c, _uid: c._id || uid() }))
        })
      )
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, editing])

  const set = key => e => setForm({ ...form, [key]: e.target.value })

  const updateChapter = (index, patch) =>
    setForm(f => ({ ...f, chapters: f.chapters.map((c, i) => (i === index ? { ...c, ...patch } : c)) }))

  function moveChapter(index, dir) {
    const target = index + dir
    if (target < 0 || target >= form.chapters.length) return
    const chapters = [...form.chapters]
    ;[chapters[index], chapters[target]] = [chapters[target], chapters[index]]
    setForm({ ...form, chapters })
  }

  function removeChapter(index) {
    if (!window.confirm('Supprimer ce chapitre ?')) return
    setForm({ ...form, chapters: form.chapters.filter((_, i) => i !== index) })
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      level: form.level,
      price: Math.max(0, Number(form.price) || 0),
      published: form.published,
      thumbnail: form.thumbnail,
      chapters: form.chapters.map(({ _uid, ...c }) => ({ ...c, title: c.title.trim() }))
    }

    if (payload.chapters.some(c => !c.title)) {
      setError('Chaque chapitre doit avoir un titre.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await send(`/courses/${id}`, payload, 'PUT')
        setSuccess('Cours enregistré.')
      } else {
        await send('/courses', payload)
        navigate('/admin/cours')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <PageHeader title={editing ? 'Modifier le cours' : 'Nouveau cours'} text="Informations, chapitres, vidéos et fichiers.">
        <Link to="/admin/cours" className={btnClass('ghost')}>Annuler</Link>
        <button disabled={saving} className={btnClass('red')}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </PageHeader>

      <Alert>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>

      {/* INFORMATIONS */}
      <Card className="space-y-5">
        <h2 className="text-lg font-extrabold">Informations générales</h2>

        <Field label="Titre du cours">
          <input required maxLength={120} value={form.title} onChange={set('title')} placeholder="Ex. : Introduction à JavaScript" className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea required rows={4} value={form.description} onChange={set('description')} placeholder="Décrivez le contenu de votre cours..." className={`${inputClass} resize-y`} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Catégorie">
            <input value={form.category} onChange={set('category')} placeholder="Ex. : Informatique" className={inputClass} />
          </Field>
          <Field label="Niveau">
            <select value={form.level} onChange={set('level')} className={inputClass}>
              {COURSE_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Prix (FCFA)" hint="0 = gratuit">
            <input type="number" min="0" step="500" value={form.price} onChange={set('price')} className={inputClass} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            {form.thumbnail ? (
              <img src={fileUrl(form.thumbnail)} alt="" className="h-16 w-24 rounded-lg object-cover" />
            ) : (
              <div className="grid h-16 w-24 place-items-center rounded-lg bg-slate-100 text-2xl">🖼️</div>
            )}
            <div className="space-y-1">
              <UploadField accept="image/*" label="Image de couverture" onUploaded={f => setForm(prev => ({ ...prev, thumbnail: f.url }))} />
              {form.thumbnail && (
                <button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} className="text-xs text-red-600 hover:underline">Retirer l’image</button>
              )}
            </div>
          </div>

          <label className="ml-auto flex cursor-pointer items-center gap-3 text-sm font-bold">
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="h-5 w-5 accent-brand" />
            Publier le cours (visible par les élèves)
          </label>
        </div>
      </Card>

      {/* CHAPITRES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Chapitres ({form.chapters.length})</h2>
          <button type="button" onClick={() => setForm({ ...form, chapters: [...form.chapters, newChapter()] })} className={btnClass('navy', 'sm')}>
            + Ajouter un chapitre
          </button>
        </div>

        {form.chapters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aucun chapitre. Ajoutez-en un pour y mettre une vidéo, du texte ou des fichiers.
          </div>
        )}

        {form.chapters.map((chapter, i) => (
          <Card key={chapter._uid} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-black text-brand-dark">{i + 1}</span>
              <input
                required
                value={chapter.title}
                onChange={e => updateChapter(i, { title: e.target.value })}
                placeholder="Titre du chapitre"
                aria-label={`Titre du chapitre ${i + 1}`}
                className={`${inputClass} font-bold`}
              />
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => moveChapter(i, -1)} disabled={i === 0} aria-label="Monter" className={btnClass('ghost', 'sm')}>↑</button>
                <button type="button" onClick={() => moveChapter(i, 1)} disabled={i === form.chapters.length - 1} aria-label="Descendre" className={btnClass('ghost', 'sm')}>↓</button>
                <button type="button" onClick={() => removeChapter(i)} aria-label="Supprimer" className={btnClass('danger', 'sm')}>🗑</button>
              </div>
            </div>

            <textarea
              rows={3}
              value={chapter.content}
              onChange={e => updateChapter(i, { content: e.target.value })}
              placeholder="Contenu / explications du chapitre (facultatif)"
              aria-label={`Contenu du chapitre ${i + 1}`}
              className={`${inputClass} resize-y`}
            />

            {/* Vidéo */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold">🎬 Vidéo</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={chapter.videoUrl}
                  onChange={e => updateChapter(i, { videoUrl: e.target.value })}
                  placeholder="Lien YouTube, Vimeo ou fichier vidéo"
                  aria-label={`Lien vidéo du chapitre ${i + 1}`}
                  className={inputClass}
                />
                <span className="text-center text-xs font-bold text-slate-400">ou</span>
                <UploadField accept="video/*" label="Importer une vidéo" onUploaded={f => updateChapter(i, { videoUrl: f.url })} />
              </div>
              {chapter.videoUrl && (
                <button type="button" onClick={() => updateChapter(i, { videoUrl: '' })} className="text-xs text-red-600 hover:underline">Retirer la vidéo</button>
              )}
            </div>

            {/* Fichiers */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold">📎 Fichiers à télécharger (PDF, Excel, Word...)</p>
              {chapter.files.length > 0 && (
                <ul className="space-y-1.5">
                  {chapter.files.map((f, j) => (
                    <li key={j} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => updateChapter(i, { files: chapter.files.filter((_, k) => k !== j) })}
                        className="shrink-0 text-xs font-bold text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <UploadField
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                label="Ajouter un fichier"
                onUploaded={f => setForm(prev => ({
                  ...prev,
                  chapters: prev.chapters.map((c, k) => (k === i ? { ...c, files: [...c.files, f] } : c))
                }))}
              />
            </div>
          </Card>
        ))}
      </section>

      <div className="flex justify-end gap-3">
        <Link to="/admin/cours" className={btnClass('ghost')}>Annuler</Link>
        <button disabled={saving} className={btnClass('red')}>{saving ? 'Enregistrement...' : 'Enregistrer le cours'}</button>
      </div>
    </form>
  )
}
