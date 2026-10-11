import ExportButtons from '../../components/ExportButtons'
import StatusBadge from '../../components/StatusBadge'
import { Alert, Empty, Loader, PageHeader, Table, tdClass } from '../../components/ui'
import { useFetch } from '../../hooks/useFetch'
import { dateFr, methodLabel, money } from '../../utils/format'
import { paymentsReport } from '../../utils/reports'

export default function StudentPayments() {
  const { data: payments, loading, error } = useFetch('/payments/me', 'payments', [])

  return (
    <div>
      <PageHeader title="Mes paiements" text="L’historique de vos achats de cours.">
        <ExportButtons config={paymentsReport(payments)} />
      </PageHeader>

      <Alert>{error}</Alert>
      {loading && <Loader />}
      {!loading && !error && (
        payments.length ? (
          <Table head={['Date', 'Cours', 'Montant', 'Mode', 'Statut']}>
            {payments.map(p => (
              <tr key={p._id}>
                <td className={`${tdClass} whitespace-nowrap`}>{dateFr(p.createdAt, true)}</td>
                <td className={`${tdClass} font-semibold`}>{p.course?.title || '—'}</td>
                <td className={`${tdClass} whitespace-nowrap font-bold`}>{money(p.amount)}</td>
                <td className={tdClass}>{methodLabel(p.method)}</td>
                <td className={tdClass}><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </Table>
        ) : (
          <Empty icon="💳" title="Aucun paiement" text="Vos achats apparaîtront ici." />
        )
      )}
    </div>
  )
}
