import mongoose from 'mongoose'
import dns from 'dns'

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connecté')
  } catch (error) {
    console.error(
      'Erreur MongoDB :',
      error.message
    )

    throw error
  }
}

export default connectDB