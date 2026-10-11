import { useState } from 'react'
import { Link } from 'react-router-dom'
import { send } from '../services/api'
import { money, PAYMENT_METHODS } from '../utils/format'
import Modal from './Modal'
import { Alert, btnClass, Field, inputClass } from './ui'

export default function PaymentModal({ course, onClose, onDone }) {
  const [method, setMethod] = useState('wave')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const selected = PAYMENT_METHODS.find(m => m.id === method)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await send('/payments', {
        courseId: course._id,
        method,
        phone: selected.phone ? phone.trim() : undefined
      })
      // Paiement en ligne (carte, Wave...) : le serveur renvoie le lien de la page de paiement
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
        return
      }
      setResult(data)
      onDone?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const confirmed = result.payment?.status === 'valide'
    return (
      <Modal title={confirmed ? 'Paiement confirmé ✅' : 'Paiement enregistré'} onClose={onClose}>
        <p className="text-sm leading-6 text-slate-600">
          {confirmed
            ? 'Merci ! Vous avez maintenant accès au cours.'
            : "Votre paiement est en attente de validation. Vous aurez accès au cours dès qu'il sera confirmé."}
        </p>
        {result.instructions && (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{result.instructions}</p>
        )}
        <div className="mt-6 flex gap-3">
          {confirmed && (
            <Link to={`/cours/${course._id}/apprendre`} className={`${btnClass('red')} flex-1`}>
              Commencer le cours
            </Link>
          )}
          <button onClick={onClose} className={`${btnClass('ghost')} flex-1`}>Fermer</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Payer ce cours" onClose={onClose}>
      <div className="mb-5 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold">{course.title}</p>
        <p className="mt-1 text-2xl font-extrabold text-brand-dark">{money(course.price)}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>

        <fieldset>
          <legend className="mb-2 text-sm font-bold">Mode de paiement</legend>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(m => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                  method === m.id ? 'border-brand bg-brand-soft/40' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                <span aria-hidden="true">{m.icon}</span>
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>

        {selected.phone && (
          <Field label="Numéro de téléphone">
            <input
              required
              type="tel"
              inputMode="tel"
              pattern="[0-9 +]{9,16}"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ex. : 77 123 45 67"
              className={inputClass}
            />
          </Field>
        )}
        {method === 'card' && (
          <p className="text-xs leading-5 text-slate-500">Vous serez redirigé vers une page de paiement sécurisée.</p>
        )}
        {method === 'cash' && (
          <p className="text-xs leading-5 text-slate-500">
            Le paiement sera validé par le professeur après réception de votre règlement.
          </p>
        )}

        <button disabled={loading} className={`${btnClass('red')} w-full`}>
          {loading ? 'Traitement...' : `Payer ${money(course.price)}`}
        </button>
      </form>
    </Modal>
  )
}
