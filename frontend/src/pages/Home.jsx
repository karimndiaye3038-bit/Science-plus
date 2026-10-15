import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { btnClass } from '../components/ui'
import { useFetch } from '../hooks/useFetch'
import { isPublished } from '../utils/course'

const ZIGZAG_TOP =
  '[clip-path:polygon(0_0,100%_0,100%_45%,92%_65%,82%_52%,74%_82%,64%_56%,53%_88%,42%_50%,32%_75%,21%_48%,11%_80%,0_48%)]'
const ZIGZAG_BOTTOM =
  '[clip-path:polygon(0_40%,10%_18%,20%_55%,32%_20%,44%_58%,55%_18%,67%_60%,79%_20%,90%_55%,100%_30%,100%_100%,0_100%)]'

const BENEFITS = ['Des cours bien organisés', 'Des vidéos et des fichiers à télécharger', 'Un suivi personnalisé', 'Un paiement simple (Wave, Orange Money...)']

const FEATURES = [
  ['📖', 'Cours en vidéo'],
  ['📈', 'Suivi des progrès'],
  ['🛡️', 'Accès sécurisé'],
  ['📱', 'Sur tous les appareils']
]

export default function Home() {
  const { data: courses } = useFetch('/courses', 'courses', [])
  const latest = courses.filter(isPublished).slice(0, 3)

  return (
    <div>
      {/* HERO */}
      <section className="relative grid items-center gap-8 overflow-hidden bg-white px-[5%] pb-28 pt-32 lg:min-h-[690px] lg:grid-cols-[45%_55%]">
        <div aria-hidden="true" className={`absolute -inset-x-[5%] top-0 h-[115px] bg-navy ${ZIGZAG_TOP}`} />
        <div aria-hidden="true" className={`absolute -inset-x-[5%] -bottom-10 h-[90px] bg-navy ${ZIGZAG_BOTTOM}`} />

        <div className="relative z-10">
          <span className="mb-5 inline-block rounded-full bg-brand-soft px-5 py-2 text-sm font-extrabold text-brand-dark">
            Plateforme de cours en ligne
          </span>
          <h1 className="text-5xl font-extrabold leading-[1] tracking-tighter sm:text-6xl">
            Apprendre.<br />Comprendre.<br /><span className="text-brand">Réussir.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            SciencePlus permet aux élèves d’accéder facilement à leurs cours en vidéo
            et au professeur de gérer ses contenus, ses élèves et ses paiements.
          </p>

          <ul className="my-7 grid gap-3 font-bold sm:grid-cols-2">
            {BENEFITS.map(b => (
              <li key={b} className="flex gap-2"><span className="text-brand">✓</span>{b}</li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/cours" className={btnClass('red')}>Découvrir les cours →</Link>
            <Link to="/#apropos" className={btnClass('outline')}>En savoir plus</Link>
          </div>
        </div>

        {/* Maquettes (grand écran) */}
        <div aria-hidden="true" className="relative hidden h-[500px] lg:block">
          <div className="absolute left-[4%] top-20 z-30 h-[350px] w-[53%] -rotate-4 rounded-3xl border-[10px] border-[#1d2738] bg-white p-6 shadow-2xl">
            <div className="border-b border-slate-200 pb-2 font-black">CoursPlus</div>
            <div className="mt-10 text-3xl font-extrabold leading-tight">Bienvenue sur <b className="text-brand">CoursPlus</b></div>
            <p className="mt-3 max-w-[250px] text-sm leading-6">Une plateforme simple et efficace pour apprendre et progresser.</p>
            <div className="absolute right-8 top-24 text-center text-7xl">📚<br /><span className="text-5xl">🎓</span></div>
            <span className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-extrabold text-white">Voir les cours</span>
          </div>

          <div className="absolute -right-[4%] top-8 h-[410px] w-[63%] rounded-xl bg-[#c4c9d0] p-2.5 shadow-2xl after:absolute after:-bottom-5 after:-left-[7%] after:h-6 after:w-[114%] after:rounded-b-3xl after:bg-[#9ba2ad]">
            <div className="flex h-full overflow-hidden rounded-lg bg-white">
              <div className="flex w-[32%] flex-col gap-4 bg-navy p-4 text-[11px] text-white">
                <b>CoursPlus</b>
                <span className="rounded-md bg-brand p-2">▣ Tableau de bord</span>
                <span>▣ Cours</span>
                <span>♙ Élèves</span>
                <span>▤ Paiements</span>
                <span>⚙ Paramètres</span>
              </div>
              <div className="flex-1 p-5">
                <div className="mb-5 font-black">Bonjour, Admin 👋</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-100 p-4 text-2xl font-black">12<strong className="mt-1 block text-[11px] text-slate-500">Cours</strong></div>
                  <div className="rounded-xl bg-slate-100 p-4 text-2xl font-black">48<strong className="mt-1 block text-[11px] text-slate-500">Élèves</strong></div>
                </div>
                <div className="mt-5 flex h-32 items-end gap-2.5">
                  {[30, 55, 42, 72, 50, 82].map((h, i) => (
                    <i key={i} className="block w-[18%] rounded-t-md bg-brand" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESPACES */}
      <section className="grid gap-8 bg-navy px-[6%] py-12 md:grid-cols-2 lg:px-[10%]">
        <div className="flex flex-col items-start gap-6 rounded-[28px] bg-linear-to-br from-brand to-brand-dark p-8 text-white sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/15 text-4xl">🎓</div>
          <div>
            <small className="text-base">Espace Professeur</small>
            <h2 className="my-1 text-3xl font-extrabold">Admin</h2>
            <p className="mb-5 leading-6 text-white/90">Gérez vos cours, vos vidéos, vos élèves et vos paiements en toute simplicité.</p>
            <Link to="/admin" className={btnClass('white')}>Accéder à l’espace Admin →</Link>
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 rounded-[28px] border border-white/15 bg-navy-soft p-8 text-white sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/15 text-4xl">👤</div>
          <div>
            <small className="text-base">Espace Élève</small>
            <h2 className="my-1 text-3xl font-extrabold">Élève</h2>
            <p className="mb-5 leading-6 text-white/90">Suivez vos cours en vidéo, téléchargez les supports et suivez votre progression.</p>
            <Link to="/eleve" className={btnClass('white')}>Accéder à l’espace Élève →</Link>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="apropos" className="grid grid-cols-2 gap-4 border-t border-white/10 bg-navy px-[6%] py-6 text-white md:grid-cols-4 lg:px-[8%]">
        {FEATURES.map(([icon, label]) => (
          <div key={label} className="flex items-center justify-center gap-2 text-center text-sm font-bold">
            <span className="text-2xl">{icon}</span>{label}
          </div>
        ))}
      </section>

      {/* DERNIERS COURS */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-5 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <small className="font-black tracking-widest text-brand-dark">APPRENDRE</small>
              <h2 className="text-3xl font-extrabold">Derniers cours</h2>
            </div>
            <Link to="/cours" className="text-sm font-bold text-brand-dark hover:underline">Tout voir →</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map(c => <CourseCard key={c._id} course={c} to={`/cours/${c._id}`} />)}
          </div>
        </section>
      )}

    
     

{/* Section À propos */}
<section
  id="apropos"
  className="bg-slate-50 px-5 py-20"
>
  <div className="mx-auto max-w-4xl text-center">
    <h2 className="text-3xl font-extrabold text-slate-900">
      À propos de CoursPlus
    </h2>

    <p className="mt-5 leading-8 text-slate-600">
      CoursPlus est une plateforme éducative conçue pour faciliter
      l’apprentissage et rendre les cours accessibles à tous les élèves.
      Notre objectif est de permettre aux élèves d’apprendre à leur rythme,
      de renforcer leurs connaissances et de mieux préparer leurs examens.
    </p>

    <p className="mt-4 leading-8 text-slate-600">
      Grâce à CoursPlus, les élèves peuvent consulter des cours,
      accéder à des vidéos pédagogiques et télécharger des documents
      pour approfondir leurs connaissances. Les contenus sont organisés
      par niveau scolaire afin de faciliter la recherche et la compréhension.
    </p>

    <p className="mt-4 leading-8 text-slate-600">
      La plateforme permet également aux professeurs de partager leurs
      connaissances, de publier des ressources pédagogiques et d’accompagner
      les élèves dans leur parcours scolaire.
    </p>

    <p className="mt-4 font-semibold text-slate-800">
      CoursPlus : apprendre aujourd’hui pour réussir demain.
    </p>
  </div>
</section>

{/* Section Contact */}
<section
  id="contact"
  className="bg-white px-5 py-20"
>
  <div className="mx-auto max-w-[1200px]">

    {/* En-tête */}
    <div className="mb-12 text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Contactez-nous
      </h2>

      <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
        Une question sur les cours, les inscriptions ou le fonctionnement
        de la plateforme ? Notre équipe est disponible pour vous accompagner.
      </p>
    </div>

    {/* Deux colonnes */}
    <div className="grid gap-10 lg:grid-cols-2">

      {/* Informations */}
      <div className="rounded-2xl bg-slate-50 p-8 sm:p-10">

        <h3 className="text-2xl font-bold text-slate-900">
          Parlons de votre projet
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          N'hésitez pas à nous contacter. Nous serons heureux de répondre
          à vos questions et de vous aider à utiliser CoursPlus.
        </p>

        {/* Téléphone */}
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <span className="text-lg">📞</span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Téléphone
            </p>

            <a
              href="tel:+221773770774"
              className="mt-1 block font-semibold text-slate-900 transition hover:text-green-600"
            >
              77 377 07 74
            </a>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <span className="text-lg">💬</span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              WhatsApp
            </p>

            <a
              href="https://wa.me/221773770774"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-semibold text-slate-900 transition hover:text-green-600"
            >
              Nous écrire sur WhatsApp
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <span className="text-lg">✉️</span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Email
            </p>

            <a
              href="mailto:contact@coursplus.sn"
              className="mt-1 block font-semibold text-slate-900 transition hover:text-green-600"
            >
              contact@coursplus.sn
            </a>
          </div>
        </div>

        {/* Localisation */}
        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
            <span className="text-lg">📍</span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Localisation
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Dakar, Sénégal
            </p>
          </div>
        </div>

        {/* WhatsApp bouton */}
        <a
          href="https://wa.me/221773770774"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Nous contacter sur WhatsApp
        </a>
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">

        <h3 className="text-2xl font-bold text-slate-900">
          Envoyez-nous un message
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Remplissez le formulaire ci-dessous et nous vous répondrons
          dans les meilleurs délais.
        </p>

        <form className="mt-8 space-y-5">

          {/* Nom */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nom complet
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Votre nom complet"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Adresse email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="exemple@email.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Sujet */}
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Sujet
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Objet de votre message"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Message
            </label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Écrivez votre message..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Envoyer le message
          </button>

        </form>
      </div>

    </div>
  </div>
</section>


    </div>
  )
}
