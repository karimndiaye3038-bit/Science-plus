import { useMemo, useState } from 'react'
import ExportButtons from '../../components/ExportButtons'
import StatusBadge from '../../components/StatusBadge'
import { Alert, btnClass, Empty, Loader, PageHeader, SearchInput, Table, tdClass } from '../../components/ui'
import { useFetch } from '../../hooks/useFetch'
import { send } from '../../services/api'
import { dateFr, methodLabel, money, STATUS } from '../../utils/format'
import { paymentsReport } from '../../utils/reports'

const TABS = [['', 'Tous'], ['en_attente', 'En attente'], ['valide', 'Validés'], ['refuse', 'Refusés']]

export default function AdminPayments() {
  const { data: payments, loading, error, setData } = useFetch('/payments', 'payments', [])
  const [tab, setTab] = useState('')
  const [search, setSearch] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments
      .filter(p => !tab || p.status === tab)
      .filter(p => !q || `${p.user?.name || ''} ${p.user?.email || ''} ${p.course?.title || ''}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [payments, tab, search])

  const total = filtered.filter(p => p.status === 'valide').reduce((s, p) => s + (Number(p.amount) || 0), 0)

  async function setStatus(payment, status) {
    setBusyId(payment._id)
    setActionError('')
    try {
      await send(`/payments/${payment._id}`, { status }, 'PATCH')
      setData(list => list.map(p => (p._id === payment._id ? { ...p, status } : p)))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <div>
      <PageHeader title="Paiements" text={`Total validé (affichage actuel) : ${money(total)}`}>
        <ExportButtons config={paymentsReport(filtered)} />
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Élève ou cours..." />
        <div className="flex flex-wrap gap-2">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${tab === id ? 'bg-navy text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              {label}
              {id && <span className="ml-1.5 opacity-60">{payments.filter(p => p.status === id).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 space-y-3"><Alert>{error}</Alert><Alert onClose={() => setActionError('')}>{actionError}</Alert></div>
      {loading && <Loader />}

      {!loading && !error && (
        filtered.length ? (
          <Table head={['Date', 'Élève', 'Cours', 'Montant', 'Mode', 'Statut', 'Actions']}>
            {filtered.map(p => (
              <tr key={p._id} className="hover:bg-slate-50/60">
                <td className={`${tdClass} whitespace-nowrap`}>{dateFr(p.createdAt, true)}</td>
                <td className={tdClass}>
                  <p className="font-bold">{p.user?.name || '—'}</p>
                  <p className="text-xs text-slate-500">{p.phone || p.user?.email}</p>
                </td>
                <td className={tdClass}>{p.course?.title || '—'}</td>
                <td className={`${tdClass} whitespace-nowrap font-bold`}>{money(p.amount)}</td>
                <td className={tdClass}>{methodLabel(p.method)}</td>
                <td className={tdClass}><StatusBadge status={p.status} /></td>
                <td className={tdClass}>
                  {p.status === 'en_attente' ? (
                    <div className="flex gap-2">
                      <button disabled={busyId === p._id} onClick={() => setStatus(p, 'valide')} className={btnClass('navy', 'sm')}>Valider</button>
                      <button disabled={busyId === p._id} onClick={() => setStatus(p, 'refuse')} className={btnClass('danger', 'sm')}>Refuser</button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">{STATUS[p.status]?.label}</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty icon="💳" title="Aucun paiement" text="Les paiements des élèves apparaîtront ici." />
        )
      )}
    </div>
  )
}
