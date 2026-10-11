import { Link } from 'react-router-dom'
import CourseCard from '../../components/CourseCard'
import StatCard from '../../components/StatCard'
import { Alert, btnClass, Empty, Loader, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { data: courses, loading, error } = useFetch('/courses/mine', 'courses', [])

  const average = courses.length ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / courses.length) : 0
  const finished = courses.filter(c => (c.progress || 0) >= 100).length

  return (
    <div>
      <PageHeader title={`Bonjour, ${user.name?.split(' ')[0] || ''} 👋`} text="Retrouvez vos cours et continuez votre apprentissage.">
        <Link to="/cours" className={btnClass('red')}>Découvrir d’autres cours</Link>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon="📚" label="Cours suivis" value={courses.length} color="bg-blue-50" />
        <StatCard icon="📈" label="Progression moyenne" value={`${average}%`} color="bg-emerald-50" />
        <StatCard icon="🏆" label="Cours terminés" value={finished} color="bg-orange-50" />
      </div>

      <h2 className="mb-4 text-xl font-extrabold">Mes cours</h2>
      <Alert>{error}</Alert>
      {loading && <Loader />}
      {!loading && !error && (
        courses.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map(c => (
              <CourseCard key={c._id} course={c} to={`/cours/${c._id}/apprendre`} cta="Continuer" progress={c.progress || 0} />
            ))}
          </div>
        ) : (
          <Empty title="Vous n’avez pas encore de cours" text="Parcourez le catalogue pour commencer.">
            <Link to="/cours" className={btnClass('red')}>Voir les cours</Link>
          </Empty>
        )
      )}
    </div>
  )
}
