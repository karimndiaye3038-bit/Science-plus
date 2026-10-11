import { useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard'
import { Alert, Empty, Loader, SearchInput } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { isPublished } from '../utils/course'

const PRICES = [['all', 'Tous'], ['free', 'Gratuits'], ['paid', 'Payants']]

const chip = active =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${active ? 'bg-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`

export default function Courses() {
  const { data, loading, error } = useFetch('/courses', 'courses', [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')

  const courses = useMemo(() => data.filter(isPublished), [data])
  const categories = useMemo(() => [...new Set(courses.map(c => c.category).filter(Boolean))], [courses])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return courses.filter(c => {
      if (category && c.category !== category) return false
      if (priceFilter === 'free' && Number(c.price) > 0) return false
      if (priceFilter === 'paid' && !(Number(c.price) > 0)) return false
      return !q || `${c.title} ${c.description}`.toLowerCase().includes(q)
    })
  }, [courses, search, category, priceFilter])

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-14">
      <small className="font-black tracking-widest text-brand-dark">APPRENDRE</small>
      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">Nos cours</h1>
      <p className="mt-2 text-slate-600">Découvrez les cours publiés par votre professeur.</p>

      <div className="mb-8 mt-8 flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un cours..." />
        <div className="flex flex-wrap gap-2">
          {PRICES.map(([id, label]) => (
            <button key={id} onClick={() => setPriceFilter(id)} className={chip(priceFilter === id)}>{label}</button>
          ))}
        </div>
        {categories.length > 0 && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Catégorie"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-brand"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        )}
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <Loader />}

      {!loading && !error && (
        filtered.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(c => <CourseCard key={c._id} course={c} to={`/cours/${c._id}`} />)}
          </div>
        ) : (
          <Empty title="Aucun cours trouvé" text={courses.length ? 'Essayez un autre filtre.' : 'Les cours arrivent bientôt.'} />
        )
      )}
    </section>
  )
}
