
import crypto from 'node:crypto'
import Payment from '../models/Payment.js'

function verifyWaveSignature(rawBody, header, secret) {
  if (!Buffer.isBuffer(rawBody) || !header || !secret) {
    return false
  }

  const parts = header.split(',')

  const timestamp = parts
    .map(part => part.trim())
    .find(part => part.startsWith('t='))
    ?.slice(2)

  const signatures = parts
    .map(part => part.trim())
    .filter(part => part.startsWith('v1='))
    .map(part => part.slice(3))

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return false
  }

  const age = Math.floor(Date.now() / 1000) - Number(timestamp)

  if (age < -30 || age > 300) {
    return false
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody.toString('utf8'))
    .digest('hex')

  return signatures.some(signature => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return false
    }

    const receivedBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')

    return (
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    )
  })
}

export async function waveWebhook(req, res) {
  try {
    const validSignature = verifyWaveSignature(
      req.body,
      req.get('Wave-Signature'),
      process.env.WAVE_WEBHOOK_SECRET
    )

    if (!validSignature) {
      return res.status(401).send('Signature invalide')
    }

    const event = JSON.parse(req.body.toString('utf8'))

    const supportedEvents = [
      'checkout.session.completed',
      'checkout.session.payment_failed'
    ]

    if (!supportedEvents.includes(event.type)) {
      return res.sendStatus(200)
    }

    const checkoutId = event.data?.id

    if (!checkoutId) {
      return res.status(400).send('Session absente')
    }

    // Vérification directe auprès de Wave.
    const response = await fetch(
      `https://api.wave.com/v1/checkout/sessions/${encodeURIComponent(checkoutId)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WAVE_API_KEY}`
        },
        signal: AbortSignal.timeout(15000)
      }
    )

    if (!response.ok) {
      console.error('Vérification Wave échouée:', response.status)
      return res.status(502).send('Vérification Wave impossible')
    }

    const session = await response.json()

    const payment = await Payment.findOne({
      waveCheckoutId: session.id
    })

    if (!payment) {
      console.error('Paiement CoursPlus introuvable:', session.id)
      return res.sendStatus(200)
    }

    const amountMatches =
      Number(session.amount) === payment.amount

    const currencyMatches = session.currency === 'XOF'

    const referenceMatches =
      session.client_reference === String(payment._id)

    if (!amountMatches || !currencyMatches || !referenceMatches) {
      console.error('Données Wave incohérentes:', payment._id)
      return res.sendStatus(200)
    }

    // Une transaction déjà validée ne doit pas être dévalidée
    // par un événement reçu en retard.
    if (payment.status === 'valide') {
      return res.sendStatus(200)
    }

    if (
      event.type === 'checkout.session.completed' &&
      session.payment_status === 'succeeded' &&
      session.checkout_status === 'complete'
    ) {
      payment.status = 'valide'
      payment.transactionId = session.transaction_id || null
      await payment.save()

      return res.sendStatus(200)
    }

    if (
      event.type === 'checkout.session.payment_failed' &&
      session.payment_status === 'failed' &&
      payment.status === 'en_attente'
    ) {
      payment.status = 'refuse'
      await payment.save()
    }

    return res.sendStatus(200)
  } catch (error) {
    console.error('Webhook Wave:', error.message)
    return res.sendStatus(500)
  }
}
