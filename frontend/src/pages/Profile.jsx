import { useState } from 'react'
import { Alert, Card, Field, PageHeader, btnClass, inputClass } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { send } from '../services/api'

// Utilisée par l'admin (Paramètres) et par l'élève (Mon profil)
export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user.name || '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = key => e => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.password && form.password !== form.confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const payload = { name: form.name.trim() }
      if (form.password) payload.password = form.password
      const data = await send('/auth/me', payload, 'PUT')
      updateUser(data.user || { ...user, name: payload.name })
      setForm({ ...form, password: '', confirm: '' })
      setSuccess('Profil mis à jour.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Mon profil" text="Modifiez vos informations personnelles." />
      <Card>
        <form onSubmit={submit} className="space-y-5">
          <Alert>{error}</Alert>
          <Alert type="success">{success}</Alert>
          <Field label="Nom complet">
            <input required value={form.name} onChange={set('name')} className={inputClass} />
          </Field>
          <Field label="Email">
            <input value={user.email || ''} disabled className={inputClass} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nouveau mot de passe" hint="facultatif">
              <input type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} className={inputClass} />
            </Field>
            <Field label="Confirmation">
              <input type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={inputClass} />
            </Field>
          </div>
          <button disabled={loading} className={btnClass('red')}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </form>
      </Card>
    </div>
  )
}
