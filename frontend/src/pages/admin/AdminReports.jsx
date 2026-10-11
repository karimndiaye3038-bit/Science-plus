import { useMemo, useState } from 'react'
import ExportButtons from '../../components/ExportButtons'
import { Alert, Card, Field, inputClass, Loader, PageHeader } from '../../components/ui'
import { useFetch } from '../../hooks/useFetch'
import { coursesReport, paymentsReport, revenueReport, studentsReport } from '../../utils/reports'

export default function AdminReports() {
  const courses = useFetch('/courses', 'courses', [])
  const students = useFetch('/students', 'students', [])
  const payments = useFetch('/payments', 'payments', [])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const loading = courses.loading || students.loading || payments.loading
  const errors = [...new Set([courses.error, students.error, payments.error].filter(Boolean))]

  // Filtre des paiements par période
  const periodPayments = useMemo(() => {
    const start = from ? new Date(from) : null
    const end = to ? new Date(`${to}T23:59:59`) : null
    return payments.data.filter(p => {
      const d = new Date(p.createdAt)
      return (!start || d >= start) && (!end || d <= end)
    })
  }, [payments.data, from, to])

  const reports = [
    { icon: '📘', title: 'Liste des cours', text: `${courses.data.length} cours`, config: coursesReport(courses.data) },
    { icon: '👨‍🎓', title: 'Liste des élèves', text: `${students.data.length} élèves`, config: studentsReport(students.data) },
    { icon: '📈', title: 'Revenus mensuels', text: '12 derniers mois (paiements validés)', config: revenueReport(payments.data) }
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Rapports" text="Téléchargez vos données au format Excel ou PDF." />
      {errors.length > 0 && <Alert>Certaines données n’ont pas pu être chargées : {errors.join(' · ')}</Alert>}
      {loading && <Loader />}

      <div className="grid gap-4 md:grid-cols-3">
        {reports.map(r => (
          <Card key={r.title} className="flex flex-col gap-4">
            <div className="text-3xl">{r.icon}</div>
            <div className="flex-1">
              <h2 className="font-extrabold">{r.title}</h2>
              <p className="text-sm text-slate-500">{r.text}</p>
            </div>
            <ExportButtons config={r.config} />
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold">💳 Rapport des paiements</h2>
          <p className="text-sm text-slate-500">Choisissez une période (facultatif), puis exportez.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:max-w-lg">
          <Field label="Du"><input type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} className={inputClass} /></Field>
          <Field label="Au"><input type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ExportButtons config={paymentsReport(periodPayments)} />
          <span className="text-sm text-slate-500">{periodPayments.length} paiement(s) sélectionné(s)</span>
        </div>
      </Card>
    </div>
  )
}
