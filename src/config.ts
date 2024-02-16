import dotenv from 'dotenv'

dotenv.config()

export const config = {
  dbUri: process.env.MONGODB_URI ?? '',
  dbName: process.env.MONGODB_DATABASE ?? '',
  dbCollection: process.env.MONGODB_COLLECTION ?? '',
}
