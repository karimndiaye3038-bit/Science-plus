// Espaces insécables remplacés : ils s'affichent mal dans les PDF
const clean = s => s.replace(/[\u202f\u00a0]/g, ' ')

export const number = n => clean(new Intl.NumberFormat('fr-FR').format(Number(n) || 0))
export const money = n => `${number(n)} FCFA`
export const price = n => (Number(n) > 0 ? money(n) : 'Gratuit')

export function dateFr(value, withTime = false) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return clean(
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
      (withTime ? ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '')
  )
}

export const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', icon: '🌊', phone: true },
  { id: 'orange_money', label: 'Orange Money', icon: '🟠', phone: true },
  { id: 'free_money', label: 'Free Money', icon: '📱', phone: true },
  { id: 'card', label: 'Carte bancaire', icon: '💳' },
  { id: 'cash', label: 'Espèces / virement', icon: '🏦' }
]

export const methodLabel = id => PAYMENT_METHODS.find(m => m.id === id)?.label || id || '—'

export const STATUS = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  valide: { label: 'Validé', cls: 'bg-green-50 text-green-700' },
  refuse: { label: 'Refusé', cls: 'bg-red-50 text-red-700' }
}
