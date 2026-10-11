import Logo from './Logo'

export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="grid min-h-screen place-items-center bg-linear-to-br from-slate-100 to-white px-5 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-navy/10">
        <div className="text-center">
          <Logo className="text-3xl" />
          <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}
