import { STATUS } from '../utils/format'

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status || '—', cls: 'bg-slate-100 text-slate-600' }
  return <span className={`inline-block whitespace-nowrap rounded-md px-2 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
}
