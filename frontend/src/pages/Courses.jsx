
import { useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard'
import { Alert, Empty, Loader, SearchInput } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { isPublished, COURSE_LEVELS } from '../utils/course'

const PRICES = [
  ['all', 'Tous les prix'],
  ['free', 'Gratuits'],
  ['paid', 'Payants']
]

const chip = active =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${
    active
      ? 'bg-navy text-white'
      : 'bg-white text-slate-600 hover:bg-slate-100'
  }`

export default function Courses() {
  const { data, loading, error } = useFetch('/courses', 'courses', [])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')

  // Garder uniquement les cours publiés
  const courses = useMemo(
    () => data.filter(isPublished),
    [data]
  )

  // Récupérer les catégories disponibles
  const categories = useMemo(
    () => [...new Set(courses.map(c => c.category).filter(Boolean))].sort(),
    [courses]
  )

  // Filtrer les cours
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return courses.filter(course => {
      // Recherche par catégorie
      if (category && course.category !== category) {
        return false
      }

      // Recherche par classe et série
      if (level && course.level !== level) {
        return false
      }

      // Filtre par prix
      if (priceFilter === 'free' && Number(course.price) > 0) {
        return false
      }

      if (priceFilter === 'paid' && !(Number(course.price) > 0)) {
        return false
      }

      // Recherche par titre et description
      const searchableText = [
        course.title,
        course.description,
        course.category,
        course.level
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return !q || searchableText.includes(q)
    })
  }, [courses, search, category, level, priceFilter])

  // Réinitialiser tous les filtres
  function resetFilters() {
    setSearch('')
    setCategory('')
    setLevel('')
    setPriceFilter('all')
  }

  const hasFilters = Boolean(
    search || category || level || priceFilter !== 'all'
  )

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-14">
      {/* En-tête */}
      <small className="font-black tracking-widest text-brand-dark">
        APPRENDRE
      </small>

      <h1 className="mt-1 text-4xl font-extrabold tracking-tight">
        Nos cours
      </h1>

      <p className="mt-2 text-slate-600">
        Découvrez les cours disponibles selon votre classe et votre série.
      </p>

      {/* Filtres */}
      <div className="mb-8 mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher un cours..."
          />

          {/* Prix */}
          <div className="flex flex-wrap gap-2">
            {PRICES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPriceFilter(id)}
                className={chip(priceFilter === id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Filtre par classe et série */}
          <div>
            <label
              htmlFor="course-level"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Classe et série
            </label>

            <select
              id="course-level"
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand"
            >
              <option value="">Toutes les classes</option>

              {COURSE_LEVELS.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div>
            <label
              htmlFor="course-category"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Matière ou catégorie
            </label>

            <select
              id="course-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-brand"
            >
              <option value="">Toutes les catégories</option>

              {categories.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Réinitialisation */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Erreurs et chargement */}
      {error && <Alert>{error}</Alert>}

      {loading && <Loader />}

      {/* Résultats */}
      {!loading && !error && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-600">
              {filtered.length} cours trouvé
              {filtered.length > 1 ? 's' : ''}
            </p>

            {level && (
              <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand-dark">
                Classe : {level}
              </span>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  to={`/cours/${course._id}`}
                />
              ))}
            </div>
          ) : (
            <Empty
              title="Aucun cours trouvé"
              text={
                courses.length
                  ? 'Aucun cours ne correspond à vos critères. Essayez de modifier les filtres.'
                  : 'Les cours arrivent bientôt.'
              }
            />
          )}
        </>
      )}
    </section>
  )
}
