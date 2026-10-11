import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ExportButtons from '../../components/ExportButtons'
import { Alert, btnClass, Empty, Loader, PageHeader, SearchInput, Table, tdClass } from '../../components/ui'
import { useFetch } from '../../hooks/useFetch'
import { api, send } from '../../services/api'
import { price } from '../../utils/format'
import { isPublished } from '../../utils/course'
import { coursesReport } from '../../utils/reports'

export default function AdminCourses() {
  const { data: courses, loading, error, setData } = useFetch('/courses', 'courses', [])
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter(c => !q || `${c.title} ${c.category || ''}`.toLowerCase().includes(q))
  }, [courses, search])

  async function togglePublished(course) {
    setActionError('')
    try {
      await send(`/courses/${course._id}`, { published: !isPublished(course) }, 'PUT')
      setData(list => list.map(c => (c._id === course._id ? { ...c, published: !isPublished(course) } : c)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function remove(course) {
    if (!window.confirm(`Supprimer le cours « ${course.title} » ? Cette action est définitive.`)) return
    setActionError('')
    try {
      await api(`/courses/${course._id}`, { method: 'DELETE' })
      setData(list => list.filter(c => c._id !== course._id))
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <PageHeader title="Cours" text={`${courses.length} cours au total`}>
        <ExportButtons config={coursesReport(filtered)} />
        <Link to="/admin/cours/nouveau" className={btnClass('red')}>+ Nouveau cours</Link>
      </PageHeader>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Rechercher un cours..." /></div>
      <div className="mb-4 space-y-3"><Alert>{error}</Alert><Alert onClose={() => setActionError('')}>{actionError}</Alert></div>
      {loading && <Loader />}

      {!loading && !error && (
        filtered.length ? (
          <Table head={['Cours', 'Prix', 'Chapitres', 'Statut', 'Actions']}>
            {filtered.map(c => (
              <tr key={c._id} className="hover:bg-slate-50/60">
                <td className={tdClass}>
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs text-slate-500">{[c.category, c.level].filter(Boolean).join(' · ') || '—'}</p>
                </td>
                <td className={`${tdClass} whitespace-nowrap font-semibold`}>{price(c.price)}</td>
                <td className={tdClass}>{c.chapters?.length || 0}</td>
                <td className={tdClass}>
                  <button
                    onClick={() => togglePublished(c)}
                    title="Cliquer pour changer"
                    className={`rounded-md px-2 py-1 text-xs font-bold ${isPublished(c) ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {isPublished(c) ? 'Publié' : 'Brouillon'}
                  </button>
                </td>
                <td className={tdClass}>
                  <div className="flex gap-2">
                    <Link to={`/admin/cours/${c._id}`} className={btnClass('ghost', 'sm')}>Modifier</Link>
                    <button onClick={() => remove(c)} className={btnClass('danger', 'sm')}>Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty title="Aucun cours" text="Créez votre premier cours pour commencer.">
            <Link to="/admin/cours/nouveau" className={btnClass('red')}>+ Nouveau cours</Link>
          </Empty>
        )
      )}
    </div>
  )
}
