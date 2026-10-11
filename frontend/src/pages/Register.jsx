import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Alert, btnClass, Field, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/eleve', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Créer un compte" subtitle="L’inscription crée automatiquement un compte Élève.">
      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        <Field label="Nom complet">
          <input required autoComplete="name" value={form.name} onChange={set('name')} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={inputClass} />
        </Field>
        <Field label="Mot de passe" hint="6 caractères minimum">
          <input type="password" minLength={6} required autoComplete="new-password" value={form.password} onChange={set('password')} className={inputClass} />
        </Field>
        <button disabled={loading} className={`${btnClass('red')} w-full`}>{loading ? 'Création...' : 'Créer mon compte'}</button>
        <p className="text-center text-sm text-slate-500">
          Déjà inscrit ? <Link to="/connexion" className="font-bold text-brand-dark">Se connecter</Link>
        </p>
      </form>
    </AuthCard>
  )
}
