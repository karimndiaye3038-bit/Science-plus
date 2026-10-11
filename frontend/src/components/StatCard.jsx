export default function StatCard({ icon, label, value, color = 'bg-blue-50' }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-xl font-extrabold sm:text-2xl">{value}</p>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{label}</p>
      </div>
    </div>
  )
}
