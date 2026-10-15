
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  House,
  BookOpen,
  Users,
  CreditCard,
  ChartNoAxesColumn,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  GraduationCap
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

const ADMIN_LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: House, end: true },
  { to: '/admin/cours', label: 'Cours', icon: BookOpen },
  { to: '/admin/eleves', label: 'Élèves', icon: Users },
  { to: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { to: '/admin/rapports', label: 'Rapports', icon: ChartNoAxesColumn },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings }
]

const STUDENT_LINKS = [
  { to: '/eleve', label: 'Mes cours', icon: BookOpen, end: true },
  { to: '/eleve/paiements', label: 'Mes paiements', icon: CreditCard },
  { to: '/eleve/profil', label: 'Mon profil', icon: Settings }
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

      {/* Fond du menu mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MENU LATÉRAL */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col
          bg-navy text-white transition-transform duration-300
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="border-b border-white/10 px-5 py-6"
          onClick={() => setOpen(false)}
        >
          <Logo className="text-2xl" />

          <p className="mt-1 text-xs text-slate-400">
            {isAdmin ? 'Espace professeur' : 'Espace élève'}
          </p>
        </Link>

        {/* Titre du menu */}
        <p className="px-5 pb-2 pt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Menu principal
        </p>

        {/* Navigation */}
        <nav
          aria-label="Menu principal"
          className="flex-1 space-y-1 overflow-y-auto px-3"
        >
          {links.map((link) => {
            const Icon = link.icon

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? 'bg-brand font-semibold text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <span>{link.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Actions en bas du menu */}
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            to="/cours"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Globe size={20} strokeWidth={1.8} />
            <span>Voir le site</span>
          </Link>

          <button
            onClick={exit}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={20} strokeWidth={1.8} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="min-w-0 flex-1">

        {/* BARRE SUPÉRIEURE */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">

          {/* Bouton menu mobile */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Informations utilisateur */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {isAdmin ? 'Professeur' : 'Élève'}
              </p>
            </div>

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark">
              {(user.name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Pages */}
        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
