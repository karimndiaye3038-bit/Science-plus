import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { btnClass } from './ui'

const linkClass = ({ isActive }) =>
  `relative py-2 text-sm font-semibold transition hover:opacity-100 ${isActive ? 'opacity-100 after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:bg-brand' : 'opacity-90'}`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  function exit() {
    logout()
    navigate('/')
    close()
  }

  const space = user?.role === 'admin' ? '/admin' : '/eleve'

  const actions = user ? (
    <>
      <Link to={space} onClick={close} className={btnClass('white')}>
        {user.role === 'admin' ? 'Espace Admin' : 'Mon espace'}
      </Link>
      <button onClick={exit} className={btnClass('red')}>Déconnexion</button>
    </>
  ) : (
    <>
      <Link to="/connexion" onClick={close} className={btnClass('white')}>Se connecter</Link>
      <Link to="/inscription" onClick={close} className={btnClass('red')}>S’inscrire</Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-lg shadow-black/10">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 lg:px-12">
        <Link to="/" onClick={close}><Logo className="text-2xl lg:text-3xl" /></Link>

        <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} className="ml-auto text-2xl md:hidden">
          {open ? '✕' : '☰'}
        </button>

        <nav
          className={`absolute inset-x-0 top-[72px] flex-col gap-4 bg-navy p-5 md:static md:flex md:flex-1 md:flex-row md:items-center md:justify-center md:gap-9 md:p-0 ${open ? 'flex' : 'hidden'}`}
        >
          <NavLink to="/" end onClick={close} className={linkClass}>Accueil</NavLink>
          <NavLink to="/cours" onClick={close} className={linkClass}>Cours</NavLink>
          <Link to="/#apropos" onClick={close} className="py-2 text-sm font-semibold opacity-90 hover:opacity-100">À propos</Link>
          <Link to="/#contact" onClick={close} className="py-2 text-sm font-semibold opacity-90 hover:opacity-100">Contact</Link>
          <div className="flex flex-col gap-3 md:hidden">{actions}</div>
        </nav>

        <div className="hidden gap-3 md:flex">{actions}</div>
      </div>
    </header>
  )
}
