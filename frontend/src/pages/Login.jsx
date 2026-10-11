import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import { Alert, btnClass, Field, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email.trim(), form.password)
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/eleve'), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard standalone title="Se connecter" subtitle="Accédez à votre espace.">
      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        <Field label="Email">
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={inputClass} />
        </Field>
        <Field label="Mot de passe">
          <input type="password" required autoComplete="current-password" value={form.password} onChange={set('password')} className={inputClass} />
        </Field>
        <button disabled={loading} className={`${btnClass('red')} w-full`}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        <p className="text-center text-sm text-slate-500">
          Pas encore de compte ? <Link to="/inscription" className="font-bold text-brand-dark">S’inscrire</Link>
        </p>
      </form>
    </AuthCard>
  )
}