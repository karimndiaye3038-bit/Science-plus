
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import UploadField from '../../components/UploadField'
import {
  Alert,
  btnClass,
  Card,
  Field,
  inputClass,
  Loader,
  PageHeader
} from '../../components/ui'
import { api, fileUrl, send } from '../../services/api'
import { COURSE_LEVELS } from '../../utils/course'

const uid = () => Math.random().toString(36).slice(2, 10)

const newSection = () => ({
  _uid: uid(),
  title: '',
  content: '',
  videoUrl: '',
  files: []
})

const newChapter = () => ({
  _uid: uid(),
  title: '',
  content: '',
  videoUrl: '',
  files: [],
  sections: []
})

const emptyCourse = {
  title: '',
  description: '',
  category: '',
  level: 'Sixième',
  price: 0,
  published: true,
  thumbnail: '',
  chapters: []
}

const ROMAN = [
  'I', 'II', 'III', 'IV', 'V',
  'VI', 'VII', 'VIII', 'IX', 'X'
]

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
      .then(({ course }) => {
        setForm({
          ...emptyCourse,
          ...course,
          price: course.price || 0,
          published: course.published !== false,
          chapters: (course.chapters || []).map(chapter => ({
            ...chapter,
            files: chapter.files || [],
            videoUrl: chapter.videoUrl || '',
            sections: (chapter.sections || []).map(section => ({
              ...section,
              _uid: section._id || uid(),
              files: section.files || [],
              videoUrl: section.videoUrl || ''
            })),
            _uid: chapter._id || uid()
          }))
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, editing])

  const set = key => e => {
    setForm(prev => ({
      ...prev,
      [key]: e.target.value
    }))
  }

  function updateChapter(index, patch) {
    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) =>
        i === index ? { ...chapter, ...patch } : chapter
      )
    }))
  }

  function updateSection(chapterIndex, sectionIndex, patch) {
    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => {
        if (i !== chapterIndex) return chapter

        return {
          ...chapter,
          sections: chapter.sections.map((section, j) =>
            j === sectionIndex
              ? { ...section, ...patch }
              : section
          )
        }
      })
    }))
  }

  function addChapter() {
    setForm(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter()]
    }))
  }

  function removeChapter(index) {
    if (!window.confirm('Supprimer ce chapitre et toutes ses parties ?')) {
      return
    }

    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== index)
    }))
  }

  function moveChapter(index, direction) {
    const target = index + direction

    if (target < 0 || target >= form.chapters.length) return

    setForm(prev => {
      const chapters = [...prev.chapters]
      ;[chapters[index], chapters[target]] = [
        chapters[target],
        chapters[index]
      ]

      return { ...prev, chapters }
    })
  }

  function addSection(chapterIndex) {
    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) =>
        i === chapterIndex
          ? {
              ...chapter,
              sections: [...chapter.sections, newSection()]
            }
          : chapter
      )
    }))
  }

  function removeSection(chapterIndex, sectionIndex) {
    if (!window.confirm('Supprimer cette grande partie ?')) return

    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) =>
        i === chapterIndex
          ? {
              ...chapter,
              sections: chapter.sections.filter(
                (_, j) => j !== sectionIndex
              )
            }
          : chapter
      )
    }))
  }

  function moveSection(chapterIndex, sectionIndex, direction) {
    const target = sectionIndex + direction
    const chapter = form.chapters[chapterIndex]

    if (!chapter || target < 0 || target >= chapter.sections.length) {
      return
    }

    setForm(prev => ({
      ...prev,
      chapters: prev.chapters.map((item, i) => {
        if (i !== chapterIndex) return item

        const sections = [...item.sections]
        ;[sections[sectionIndex], sections[target]] = [
          sections[target],
          sections[sectionIndex]
        ]

        return { ...item, sections }
      })
    }))
  }

  function updateFiles(chapterIndex, sectionIndex, files) {
    if (sectionIndex === null) {
      updateChapter(chapterIndex, { files })
    } else {
      updateSection(chapterIndex, sectionIndex, { files })
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const chapters = form.chapters.map(chapter => ({
      ...chapter,
      title: chapter.title.trim(),
      sections: (chapter.sections || []).map(section => ({
        ...section,
        title: section.title.trim()
      }))
    }))

    if (chapters.some(chapter => !chapter.title)) {
      setError('Chaque chapitre doit avoir un titre.')
      return
    }

    if (chapters.some(chapter =>
      chapter.sections.some(section => !section.title)
    )) {
      setError('Chaque grande partie doit avoir un titre.')
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      level: form.level,
      price: Math.max(0, Number(form.price) || 0),
      published: form.published,
      thumbnail: form.thumbnail,
      chapters: chapters.map(({ _uid, ...chapter }) => ({
        ...chapter,
        sections: chapter.sections.map(({ _uid, _id, ...section }) => section)
      })).map(chapter => {
        const { _id, ...rest } = chapter
        return rest
      })
    }

    setSaving(true)

    try {
      if (editing) {
        await send(`/courses/${id}`, payload, 'PUT')
        setSuccess('Cours et grandes parties enregistrés.')
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

  function SectionEditor({ chapter, chapterIndex, section, sectionIndex }) {
    return (
      <div className="space-y-4 rounded-2xl border border-brand/20 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-brand-soft px-3 py-2 text-sm font-black text-brand-dark">
            Grand {ROMAN[sectionIndex] || sectionIndex + 1}
          </span>

          <input
            required
            value={section.title}
            onChange={e =>
              updateSection(chapterIndex, sectionIndex, {
                title: e.target.value
              })
            }
            placeholder="Titre de la grande partie"
            aria-label={`Titre de la partie ${sectionIndex + 1}`}
            className={`${inputClass} min-w-0 flex-1 font-bold`}
          />

          <button
            type="button"
            onClick={() => moveSection(chapterIndex, sectionIndex, -1)}
            disabled={sectionIndex === 0}
            className={btnClass('ghost', 'sm')}
            aria-label="Monter la partie"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => moveSection(chapterIndex, sectionIndex, 1)}
            disabled={sectionIndex === chapter.sections.length - 1}
            className={btnClass('ghost', 'sm')}
            aria-label="Descendre la partie"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() => removeSection(chapterIndex, sectionIndex)}
            className={btnClass('danger', 'sm')}
          >
            Supprimer
          </button>
        </div>

        <textarea
          rows={4}
          value={section.content}
          onChange={e =>
            updateSection(chapterIndex, sectionIndex, {
              content: e.target.value
            })
          }
          placeholder="Expliquez cette partie du cours..."
          className={`${inputClass} resize-y`}
        />

        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold">🎬 Vidéo de cette partie</p>

          <input
            value={section.videoUrl}
            onChange={e =>
              updateSection(chapterIndex, sectionIndex, {
                videoUrl: e.target.value
              })
            }
            placeholder="Lien YouTube, Vimeo ou vidéo importée"
            className={inputClass}
          />

          <UploadField
            accept="video/*"
            label="Importer une vidéo"
            onUploaded={file =>
              updateSection(chapterIndex, sectionIndex, {
                videoUrl: file.url
              })
            }
          />

          {section.videoUrl && (
            <button
              type="button"
              onClick={() =>
                updateSection(chapterIndex, sectionIndex, {
                  videoUrl: ''
                })
              }
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Retirer la vidéo
            </button>
          )}
        </div>

        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold">
            📎 Documents de cette partie
          </p>

          {section.files.length > 0 && (
            <ul className="space-y-2">
              {section.files.map((file, j) => (
                <li
                  key={`${file.url}-${j}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                >
                  <span className="truncate">{file.name}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateFiles(
                        chapterIndex,
                        sectionIndex,
                        section.files.filter((_, k) => k !== j)
                      )
                    }
                    className="shrink-0 text-xs font-bold text-red-600"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}

          <UploadField
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
            label="Ajouter un document"
            onUploaded={file =>
              updateFiles(chapterIndex, sectionIndex, [
                ...section.files,
                file
              ])
            }
          />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <PageHeader
        title={editing ? 'Modifier le cours' : 'Nouveau cours'}
        text="Organisez votre cours en chapitres et grandes parties."
      >
        <Link to="/admin/cours" className={btnClass('ghost')}>
          Annuler
        </Link>

        <button disabled={saving} className={btnClass('red')}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </PageHeader>

      <Alert>{error}</Alert>
      <Alert type="success" onClose={() => setSuccess('')}>
        {success}
      </Alert>

      {/* INFORMATIONS GENERALES */}
      <Card className="space-y-5">
        <h2 className="text-lg font-extrabold">
          Informations générales
        </h2>

        <Field label="Titre du cours">
          <input
            required
            maxLength={120}
            value={form.title}
            onChange={set('title')}
            placeholder="Ex. : Les fonctions mathématiques"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={set('description')}
            placeholder="Décrivez le contenu de votre cours..."
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Matière ou catégorie">
            <input
              value={form.category}
              onChange={set('category')}
              placeholder="Ex. : Mathématiques"
              className={inputClass}
            />
          </Field>

          <Field label="Classe et série">
            <select
              value={form.level}
              onChange={set('level')}
              className={inputClass}
            >
              {COURSE_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Prix (FCFA)" hint="0 = gratuit">
            <input
              type="number"
              min="0"
              step="500"
              value={form.price}
              onChange={set('price')}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            {form.thumbnail ? (
              <img
                src={fileUrl(form.thumbnail)}
                alt="Couverture du cours"
                className="h-16 w-24 rounded-lg object-cover"
              />
            ) : (
              <div className="grid h-16 w-24 place-items-center rounded-lg bg-slate-100 text-2xl">
                🖼️
              </div>
            )}

            <div className="space-y-1">
              <UploadField
                accept="image/*"
                label="Image de couverture"
                onUploaded={file =>
                  setForm(prev => ({
                    ...prev,
                    thumbnail: file.url
                  }))
                }
              />

              {form.thumbnail && (
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({ ...prev, thumbnail: '' }))
                  }
                  className="text-xs text-red-600 hover:underline"
                >
                  Retirer l’image
                </button>
              )}
            </div>
          </div>

          <label className="ml-auto flex cursor-pointer items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  published: e.target.checked
                }))
              }
              className="h-5 w-5 accent-brand"
            />
            Publier le cours
          </label>
        </div>
      </Card>

      {/* CHAPITRES */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold">
            Chapitres ({form.chapters.length})
          </h2>

          <button
            type="button"
            onClick={addChapter}
            className={btnClass('navy', 'sm')}
          >
            + Ajouter un chapitre
          </button>
        </div>

        {form.chapters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aucun chapitre. Ajoutez-en un pour commencer votre cours.
          </div>
        )}

        {form.chapters.map((chapter, i) => (
          <Card key={chapter._uid} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-black text-brand-dark">
                {i + 1}
              </span>

              <input
                required
                value={chapter.title}
                onChange={e =>
                  updateChapter(i, { title: e.target.value })
                }
                placeholder="Titre du chapitre"
                className={`${inputClass} min-w-0 flex-1 font-bold`}
              />

              <button
                type="button"
                onClick={() => moveChapter(i, -1)}
                disabled={i === 0}
                className={btnClass('ghost', 'sm')}
                aria-label="Monter le chapitre"
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() => moveChapter(i, 1)}
                disabled={i === form.chapters.length - 1}
                className={btnClass('ghost', 'sm')}
                aria-label="Descendre le chapitre"
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() => removeChapter(i)}
                className={btnClass('danger', 'sm')}
              >
                🗑
              </button>
            </div>

            <textarea
              rows={3}
              value={chapter.content}
              onChange={e =>
                updateChapter(i, { content: e.target.value })
              }
              placeholder="Introduction générale du chapitre (facultatif)"
              className={`${inputClass} resize-y`}
            />

            {/* VIDEO DU CHAPITRE */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold">
                🎬 Vidéo générale du chapitre
              </p>

              <input
                value={chapter.videoUrl}
                onChange={e =>
                  updateChapter(i, { videoUrl: e.target.value })
                }
                placeholder="Lien YouTube, Vimeo ou vidéo importée"
                className={inputClass}
              />

              <UploadField
                accept="video/*"
                label="Importer une vidéo"
                onUploaded={file =>
                  updateChapter(i, { videoUrl: file.url })
                }
              />

              {chapter.videoUrl && (
                <button
                  type="button"
                  onClick={() => updateChapter(i, { videoUrl: '' })}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Retirer la vidéo
                </button>
              )}
            </div>

            {/* DOCUMENTS DU CHAPITRE */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold">
                📎 Documents généraux du chapitre
              </p>

              {chapter.files.length > 0 && (
                <ul className="space-y-2">
                  {chapter.files.map((file, j) => (
                    <li
                      key={`${file.url}-${j}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm"
                    >
                      <span className="truncate">{file.name}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateChapter(i, {
                            files: chapter.files.filter(
                              (_, k) => k !== j
                            )
                          })
                        }
                        className="shrink-0 text-xs font-bold text-red-600"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <UploadField
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                label="Ajouter un document"
                onUploaded={file =>
                  updateChapter(i, {
                    files: [...chapter.files, file]
                  })
                }
              />
            </div>

            {/* GRANDES PARTIES */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">
                    Grandes parties ({chapter.sections.length})
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Grand I, Grand II, Grand III...
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addSection(i)}
                  className={btnClass('navy', 'sm')}
                >
                  + Ajouter une grande partie
                </button>
              </div>

              {chapter.sections.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                  Aucune grande partie. Ajoutez-en pour détailler ce chapitre.
                </div>
              )}

              {chapter.sections.map((section, j) => (
                <SectionEditor
                  key={section._uid}
                  chapter={chapter}
                  chapterIndex={i}
                  section={section}
                  sectionIndex={j}
                />
              ))}
            </div>
          </Card>
        ))}
      </section>

      {/* ENREGISTREMENT */}
      <div className="flex flex-wrap justify-end gap-3">
        <Link to="/admin/cours" className={btnClass('ghost')}>
          Annuler
        </Link>

        <button
          disabled={saving}
          className={btnClass('red')}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer le cours'}
        </button>
      </div>
    </form>
  )
}
