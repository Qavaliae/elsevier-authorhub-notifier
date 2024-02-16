import { config } from './config'
import { notify } from './notify'
import { Db, MongoClient } from 'mongodb'
import { State, Store } from './types'
import axios from 'axios'

const client = new MongoClient(config.db.uri)

//--------------------------------------------------------------
// Program entry
//--------------------------------------------------------------

const main = async () => {
  // Establish connection
  await client.connect()
  const db = client.db(config.db.name)

  // Retrieve current store
  const store = await retrieveStore(db)

  // Retrieve current state
  const state = await retrieveState(store.tracker)

  // If state was updated, notify and persist store with new state
  if (state.LastUpdated !== store.state?.LastUpdated) {
    console.log('Detected an update to state.')

    store.state = state
    await notify(store)

    await persistStore(db, store)
  } else {
    console.log('State was not updated.')
  }
}

// Retrieve current store
const retrieveStore = async (db: Db): Promise<Store> => {
  const store = (
    await db
      .collection('stores')
      .find()
      .sort({ priority: 1 })
      .limit(1)
      .toArray()
  )[0]

  if (!store) {
    throw new Error(`No entry in collection 'stores'.`)
  }

  return store as unknown as Store
}

// Persist store
const persistStore = async (db: Db, store: Store) => {
  await db.collection('stores').updateOne({ _id: store._id }, { $set: store })
}

// Retrieve current state
const retrieveState = async (tracker: string): Promise<State> => {
  const state = await axios.get(tracker).then((response) => response.data)
  return state as State
}

//--------------------------------------------------------------
// Run program
//--------------------------------------------------------------

main().finally(() => client.close())
