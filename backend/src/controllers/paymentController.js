
import Payment from '../models/Payment.js'
import Course from '../models/Course.js'

export async function createPayment(req, res) {
  let payment

  try {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({
        message: 'Le cours est obligatoire.'
      })
    }

    if (!process.env.WAVE_API_KEY) {
      return res.status(500).json({
        message: 'La configuration Wave est manquante.'
      })
    }

    const frontendUrl = process.env.FRONTEND_URL

    if (!frontendUrl || !frontendUrl.startsWith('https://')) {
      return res.status(500).json({
        message: 'Une URL HTTPS du frontend est nécessaire.'
      })
    }

    const course = await Course.findById(courseId)

    if (!course || !course.published) {
      return res.status(404).json({
        message: 'Cours introuvable ou non publié.'
      })
    }

    // Un cours gratuit ne nécessite pas de paiement.
    if (course.price === 0) {
      return res.status(400).json({
        message: 'Ce cours est gratuit. Aucun paiement nécessaire.'
      })
    }

    if (!Number.isFinite(course.price) || course.price < 0) {
      return res.status(400).json({
        message: 'Le prix du cours est invalide.'
      })
    }

    // Évite de créer un deuxième paiement valide.
    const alreadyPaid = await Payment.findOne({
      user: req.user._id,
      course: course._id,
      status: 'valide'
    })

    if (alreadyPaid) {
      return res.status(409).json({
        message: 'Ce cours a déjà été payé.'
      })
    }

    payment = await Payment.create({
      user: req.user._id,
      course: course._id,
      amount: course.price,
      method: 'wave',
      status: 'en_attente'
    })

    const payload = {
      amount: String(payment.amount),
      currency: 'XOF',
      client_reference: String(payment._id),
      success_url:
        `${frontendUrl}/paiement/retour?paymentId=${payment._id}`,
      error_url:
        `${frontendUrl}/paiement/retour?paymentId=${payment._id}&error=1`
    }

    const response = await fetch(
      'https://api.wave.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      }
    )

    const session = await response.json()

    if (
      !response.ok ||
      !session.id ||
      !session.wave_launch_url
    ) {
      console.error('Erreur création session Wave:', response.status)

      return res.status(502).json({
        message: 'Wave n’a pas pu créer la session de paiement.',
        paymentId: payment._id
      })
    }

    payment.waveCheckoutId = session.id
    payment.clientReference = String(payment._id)
    await payment.save()

    return res.status(201).json({
      message: 'Session de paiement créée.',
      paymentId: payment._id,
      paymentUrl: session.wave_launch_url
    })
  } catch (error) {
    console.error('Création paiement:', error.message)

    // Ne pas supprimer automatiquement une transaction :
    // Wave peut avoir créé la session même si la réponse a échoué.
    return res.status(500).json({
      message: 'Erreur lors de la création du paiement.',
      paymentId: payment?._id || null
    })
  }
}

export async function myPayments(req, res) {
  try {
    const payments = await Payment.find({
      user: req.user._id
    })
      .populate('course', 'title price thumbnail')
      .sort({ createdAt: -1 })

    return res.json(payments)
  } catch (error) {
    console.error('Mes paiements:', error.message)

    return res.status(500).json({
      message: 'Impossible de récupérer les paiements.'
    })
  }
}

// Un élève ne peut consulter que ses propres paiements.
export async function getMyPaymentStatus(req, res) {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('course', 'title price')

    if (!payment) {
      return res.status(404).json({
        message: 'Paiement introuvable.'
      })
    }

    return res.json({
      paymentId: payment._id,
      status: payment.status,
      amount: payment.amount,
      course: payment.course
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Impossible de vérifier le paiement.'
    })
  }
}

// À conserver pour l'administration.
// Cette fonction ne doit pas servir à confirmer manuellement
// un paiement Wave sans vérification auprès du fournisseur.
export async function listPayments(req, res) {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })

    return res.json(payments)
  } catch (error) {
    return res.status(500).json({
      message: 'Impossible de récupérer les paiements.'
    })
  }
}

// Les changements manuels de statut sont volontairement interdits ici.
// La validation d'un paiement Wave doit venir du webhook vérifié.
export async function updatePayment(req, res) {
  return res.status(403).json({
    message: 'Le statut Wave est géré automatiquement après vérification.'
  })
}
