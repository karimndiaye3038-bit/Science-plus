/* Petits éléments d'interface réutilisables */

export function btnClass(variant = 'red', size = 'md') {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60'
  const sizes = { md: 'px-5 py-3 text-sm', sm: 'px-3.5 py-2 text-xs' }
  const variants = {
    red: 'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand-soft',
    white: 'bg-white text-navy hover:bg-slate-100 focus-visible:ring-white/40',
    outline: 'border-2 border-brand bg-white text-brand-dark hover:bg-brand-soft/50 focus-visible:ring-brand-soft',
    ghost: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200',
    danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-100',
    navy: 'bg-navy text-white hover:bg-navy-soft focus-visible:ring-slate-300'
  }
  return `${base} ${sizes[size]} ${variants[variant]}`
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-navy outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand-soft disabled:bg-slate-50'

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-bold">
        {label}
        {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const alertStyles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700'
}

export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${alertStyles[type]}`}>
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0 font-bold">
          ✕
        </button>
      )}
    </div>
  )
}

export function Loader({ label = 'Chargement...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500" aria-busy="true">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
      {label}
    </div>
  )
}

export function Empty({ icon = '📚', title, text, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 font-bold">{title}</h3>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  )
}

export function PageHeader({ title, text, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function Card({ className = '', children }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</div>
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft sm:max-w-xs">
      <span className="text-slate-400" aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  )
}

export function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            {head.map(h => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}
export const tdClass = 'px-4 py-3 align-middle'
