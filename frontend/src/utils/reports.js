import { dateFr, methodLabel, STATUS } from './format'
import { isPublished } from './course'

const stamp = () => new Date().toISOString().slice(0, 10)

export function coursesReport(courses) {
  return {
    fileName: `cours-${stamp()}`,
    title: 'Liste des cours',
    columns: [
      { header: 'Titre', key: 'title', width: 36 },
      { header: 'Catégorie', key: 'category', width: 18 },
      { header: 'Niveau', key: 'level', width: 16 },
      { header: 'Prix (FCFA)', key: 'price', width: 14 },
      { header: 'Chapitres', key: 'chapters', width: 12 },
      { header: 'Statut', key: 'status', width: 14 }
    ],
    rows: courses.map(c => ({
      title: c.title,
      category: c.category || '—',
      level: c.level || '—',
      price: Number(c.price) || 0,
      chapters: c.chapters?.length || 0,
      status: isPublished(c) ? 'Publié' : 'Brouillon'
    }))
  }
}

export function studentsReport(students) {
  return {
    fileName: `eleves-${stamp()}`,
    title: 'Liste des élèves',
    columns: [
      { header: 'Nom', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 34 },
      { header: 'Inscrit le', key: 'date', width: 16 },
      { header: 'Cours suivis', key: 'courses', width: 14 }
    ],
    rows: students.map(s => ({
      name: s.name,
      email: s.email,
      date: dateFr(s.createdAt),
      courses: s.coursesCount ?? s.courses?.length ?? 0
    }))
  }
}

export function paymentsReport(payments) {
  return {
    fileName: `paiements-${stamp()}`,
    title: 'Historique des paiements',
    columns: [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Élève', key: 'student', width: 26 },
      { header: 'Cours', key: 'course', width: 32 },
      { header: 'Montant (FCFA)', key: 'amount', width: 16 },
      { header: 'Mode', key: 'method', width: 18 },
      { header: 'Statut', key: 'status', width: 14 }
    ],
    rows: payments.map(p => ({
      date: dateFr(p.createdAt, true),
      student: p.user?.name || '—',
      course: p.course?.title || '—',
      amount: Number(p.amount) || 0,
      method: methodLabel(p.method),
      status: STATUS[p.status]?.label || p.status || '—'
    }))
  }
}

// Revenus validés regroupés par mois (les plus récents en dernier)
export function monthlyRevenue(payments, months = 6) {
  const buckets = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('fr-FR', { month: 'short' }),
      total: 0,
      count: 0
    })
  }
  payments
    .filter(p => p.status === 'valide')
    .forEach(p => {
      const d = new Date(p.createdAt)
      const bucket = buckets.find(b => b.key === `${d.getFullYear()}-${d.getMonth()}`)
      if (bucket) {
        bucket.total += Number(p.amount) || 0
        bucket.count += 1
      }
    })
  return buckets
}

export function revenueReport(payments) {
  return {
    fileName: `revenus-${stamp()}`,
    title: 'Revenus mensuels (paiements validés)',
    columns: [
      { header: 'Mois', key: 'month', width: 16 },
      { header: 'Paiements', key: 'count', width: 14 },
      { header: 'Revenus (FCFA)', key: 'total', width: 18 }
    ],
    rows: monthlyRevenue(payments, 12).map(b => ({ month: b.label, count: b.count, total: b.total }))
  }
}
