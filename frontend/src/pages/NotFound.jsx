import { Link } from 'react-router-dom'
import { btnClass } from '../components/ui'

export default function NotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center px-5 text-center">
      <div>
        <p className="text-7xl font-black text-brand">404</p>
        <h1 className="mt-3 text-2xl font-extrabold">Page introuvable</h1>
        <p className="mt-2 text-slate-500">Cette page n’existe pas ou a été déplacée.</p>
        <Link to="/" className={`${btnClass('red')} mt-6`}>Retour à l’accueil</Link>
      </div>
    </section>
  )
}
