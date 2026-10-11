import { useState } from 'react'
import { exportExcel, exportPdf } from '../utils/export'
import { btnClass } from './ui'

// config = { fileName, title, columns, rows } (voir utils/reports.js)
export default function ExportButtons({ config, disabled = false }) {
  const [busy, setBusy] = useState('')

  async function run(kind) {
    setBusy(kind)
    try {
      await (kind === 'excel' ? exportExcel(config) : exportPdf(config))
    } catch {
      alert("L'export a échoué. Réessayez.")
    } finally {
      setBusy('')
    }
  }

  const off = disabled || !config.rows.length || Boolean(busy)

  return (
    <div className="flex gap-2">
      <button type="button" disabled={off} onClick={() => run('excel')} className={btnClass('ghost', 'sm')}>
        {busy === 'excel' ? 'Export...' : '📗 Excel'}
      </button>
      <button type="button" disabled={off} onClick={() => run('pdf')} className={btnClass('ghost', 'sm')}>
        {busy === 'pdf' ? 'Export...' : '📕 PDF'}
      </button>
    </div>
  )
}
