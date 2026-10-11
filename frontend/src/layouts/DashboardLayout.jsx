import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: '⌂', end: true },
  { to: '/admin/cours', label: 'Cours', icon: '▤' },
  { to: '/admin/eleves', label: 'Élèves', icon: '♧' },
  { to: '/admin/paiements', label: 'Paiements', icon: '💳' },
  { to: '/admin/rapports', label: 'Rapports', icon: '▥' },
  { to: '/admin/parametres', label: 'Paramètres', icon: '⚙' }
]

const STUDENT_LINKS = [
  { to: '/eleve', label: 'Mes cours', icon: '▤', end: true },
  { to: '/eleve/paiements', label: 'Mes paiements', icon: '💳' },
  { to: '/eleve/profil', label: 'Mon profil', icon: '⚙' }
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const isAdmin = user.role === 'admin'
  const links = isAdmin ? ADMIN_LINKS : STUDENT_LINKS

  function exit() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {open && <div className="fixed inset-0 z-30 bg-navy/50 md:hidden" onClick={() => setOpen(false)} />}

      {/* MENU LATÉRAL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/" className="border-b border-white/10 px-5 py-6">
          <Logo className="text-2xl" />
          <p className="mt-1 text-xs text-slate-400">{isAdmin ? 'Espace professeur' : 'Espace élève'}</p>
        </Link>

        <p className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">Menu principal</p>
        <nav aria-label="Menu principal" className="flex-1 space-y-1 overflow-y-auto px-3">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  isActive ? 'bg-brand font-semibold text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="w-6 text-center text-lg" aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link to="/cours" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
            <span className="w-6 text-center text-lg" aria-hidden="true">🌐</span> Voir le site
          </Link>
          <button onClick={exit} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-white">
            <span className="w-6 text-center text-lg" aria-hidden="true">⎋</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="text-2xl md:hidden">☰</button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500">{isAdmin ? 'Professeur' : 'Élève'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark">
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
