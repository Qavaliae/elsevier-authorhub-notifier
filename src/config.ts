import dotenv from 'dotenv'

dotenv.config()

export const config = {
  db: {
    uri: process.env.MONGODB_URI ?? '',
    name: process.env.MONGODB_NAME ?? '',
  }
}
