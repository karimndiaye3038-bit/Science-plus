import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import { Alert, btnClass, Card, Loader, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { dateFr, money, number } from '../../utils/format'
import { monthlyRevenue } from '../../utils/reports'

export default function AdminDashboard() {
  const { user } = useAuth()
  const courses = useFetch('/courses', 'courses', [])
  const students = useFetch('/students', 'students', [])
  const payments = useFetch('/payments', 'payments', [])

  const loading = courses.loading || students.loading || payments.loading
  const errors = [courses.error, students.error, payments.error].filter(Boolean)

  const validated = payments.data.filter(p => p.status === 'valide')
  const revenue = validated.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const pending = payments.data.filter(p => p.status === 'en_attente').length
  const months = monthlyRevenue(payments.data, 6)
  const max = Math.max(...months.map(m => m.total), 1)
  const recent = [...payments.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader title={`Bonjour, ${user.name?.split(' ')[0] || 'Admin'} 👋`} text="Voici un aperçu de votre plateforme.">
        <Link to="/admin/cours/nouveau" className={btnClass('red')}>+ Nouveau cours</Link>
      </PageHeader>

      {errors.length > 0 && <Alert>Certaines données n’ont pas pu être chargées : {[...new Set(errors)].join(' · ')}</Alert>}
      {loading && <Loader />}

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon="📘" label="Cours" value={courses.data.length} color="bg-blue-50" />
        <StatCard icon="👨‍🎓" label="Élèves inscrits" value={students.data.length} color="bg-emerald-50" />
        <StatCard icon="💰" label="Revenus validés" value={money(revenue)} color="bg-orange-50" />
        <StatCard icon="⏳" label="Paiements en attente" value={pending} color="bg-purple-50" />
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-extrabold">Revenus des 6 derniers mois</h2>
          <p className="mb-5 text-sm text-slate-500">Paiements validés, en FCFA.</p>
          <div className="flex h-52 items-end gap-3">
            {months.map(m => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11px] font-bold text-slate-500">{m.total ? number(m.total) : ''}</span>
                <div
                  className="w-full rounded-t-lg bg-brand transition-all"
                  style={{ height: `${Math.max((m.total / max) * 100, m.total ? 4 : 1)}%` }}
                  title={`${m.label} : ${money(m.total)}`}
                />
                <span className="text-xs font-semibold capitalize text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Derniers paiements</h2>
            <Link to="/admin/paiements" className="text-sm font-bold text-brand-dark hover:underline">Tout voir</Link>
          </div>
          {recent.length ? (
            <ul className="divide-y divide-slate-100">
              {recent.map(p => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{p.user?.name || '—'}</p>
                    <p className="truncate text-xs text-slate-500">{p.course?.title || '—'} · {dateFr(p.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-extrabold">{money(p.amount)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">Aucun paiement pour le moment.</p>
          )}
        </Card>
      </section>
    </div>
  )
}
