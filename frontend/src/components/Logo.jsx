export default function Logo({ className = 'text-3xl' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold ${className}`}>
      <span aria-hidden="true">🎓</span>
      <span>
        Cours<span className="text-brand">Plus</span>
      </span>
    </span>
  )
}
