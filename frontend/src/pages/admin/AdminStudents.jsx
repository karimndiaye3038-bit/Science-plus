import { useMemo, useState } from 'react'
import ExportButtons from '../../components/ExportButtons'
import { Alert, Empty, Loader, PageHeader, SearchInput, Table, tdClass } from '../../components/ui'
import { useFetch } from '../../hooks/useFetch'
import { dateFr } from '../../utils/format'
import { studentsReport } from '../../utils/reports'

export default function AdminStudents() {
  const { data: students, loading, error } = useFetch('/students', 'students', [])
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter(s => !q || `${s.name} ${s.email}`.toLowerCase().includes(q))
  }, [students, search])

  return (
    <div>
      <PageHeader title="Élèves" text={`${students.length} élève${students.length > 1 ? 's' : ''} inscrit${students.length > 1 ? 's' : ''}`}>
        <ExportButtons config={studentsReport(filtered)} />
      </PageHeader>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Rechercher un élève..." /></div>
      <Alert>{error}</Alert>
      {loading && <Loader />}

      {!loading && !error && (
        filtered.length ? (
          <Table head={['Élève', 'Email', 'Inscrit le', 'Cours suivis']}>
            {filtered.map(s => (
              <tr key={s._id} className="hover:bg-slate-50/60">
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark">
                      {(s.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="font-bold">{s.name}</span>
                  </div>
                </td>
                <td className={tdClass}>{s.email}</td>
                <td className={`${tdClass} whitespace-nowrap`}>{dateFr(s.createdAt)}</td>
                <td className={tdClass}>{s.coursesCount ?? s.courses?.length ?? 0}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty icon="👨‍🎓" title="Aucun élève" text={students.length ? 'Aucun résultat pour cette recherche.' : 'Les élèves apparaîtront ici dès leur inscription.'} />
        )
      )}
    </div>
  )
}
