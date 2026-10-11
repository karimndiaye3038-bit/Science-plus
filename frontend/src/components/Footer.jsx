import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-slate-300">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-5 py-8 text-sm sm:flex-row lg:px-12">
        <Logo className="text-xl text-white" />
        <nav className="flex gap-6">
          <Link to="/cours" className="hover:text-white">Cours</Link>
          <Link to="/connexion" className="hover:text-white">Connexion</Link>
          <Link to="/inscription" className="hover:text-white">Inscription</Link>
        </nav>
        <p>© {new Date().getFullYear()} CoursPlus — Apprendre aujourd’hui, réussir demain.</p>
      </div>
    </footer>
  )
}
