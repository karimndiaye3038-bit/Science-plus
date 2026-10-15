
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp
} from 'lucide-react'

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa'

import Logo from './Logo'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer className="bg-navy-dark text-slate-300">

      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-12">

        {/* Partie principale */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Présentation */}
          <div>
            <Logo className="text-2xl text-white" />

            <p className="mt-5 max-w-[320px] text-sm leading-6 text-slate-400">
              CoursPlus est une plateforme d’apprentissage qui permet
              à chacun de développer ses compétences, suivre des cours
              et progresser à son propre rythme.
            </p>

            {/* Réseaux sociaux */}
            <div className="mt-6 flex items-center gap-3">

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full
                bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
               <FaFacebookF className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full
                bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
            <FaInstagram className="h-4 w-4" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full
                bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
              <FaLinkedinIn className="h-4 w-4" />
              </a>

            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-white"
                >
                  Accueil
                </Link>
              </li>

              <li>
                <Link
                  to="/cours"
                  className="transition hover:text-white"
                >
                  Nos cours
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="transition hover:text-white"
                >
                  À propos
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="transition hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Ressources
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/faq"
                  className="transition hover:text-white"
                >
                  Questions fréquentes
                </Link>
              </li>

              <li>
                <Link
                  to="/help"
                  className="transition hover:text-white"
                >
                  Centre d’aide
                </Link>
              </li>

              <li>
                <Link
                  to="/privacy"
                  className="transition hover:text-white"
                >
                  Confidentialité
                </Link>
              </li>

              <li>
                <Link
                  to="/terms"
                  className="transition hover:text-white"
                >
                  Conditions d’utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>

            <ul className="space-y-4 text-sm">

              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>contact@coursplus.sn</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>+221 77 000 00 00</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>Dakar, Sénégal</span>
              </li>

            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-white">
                Restez informé
              </p>

              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/5">

                <input
                  type="email"
                  placeholder="Votre email"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5
                  text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  className="px-4 text-sm font-medium text-white
                  transition hover:bg-white/10"
                >
                  S'inscrire
                </button>

              </div>
            </div>
          </div>

        </div>

        {/* Séparateur */}
        <div className="my-10 border-t border-white/10" />

        {/* Bas du footer */}
        <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} CoursPlus. Tous droits réservés.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 transition hover:text-white"
          >
            Retour en haut
            <ArrowUp className="h-4 w-4" />
          </button>

        </div>

      </div>
    </footer>
  )
}
