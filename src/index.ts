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

  // Retrieve enabled stores
  const stores = await retrieveStores(db)

  // Process stores
  for (const store of stores) {
    await processStore(db, store).catch((e) =>
      console.error(`${store._id}: error processing store`),
    )
  }
}

// Run processing logic for a specific store
const processStore = async (db: Db, store: Store): Promise<void> => {
  // Retrieve current state
  const state = await retrieveState(store.tracker)

  // If state was updated, notify and persist store with new state
  if (state.LastUpdated !== store.state?.LastUpdated) {
    console.log(`${store._id}: detected an update to state`)

    store.state = state
    await notify(store)

    await persistStore(db, store)
  } else {
    console.log(`${store._id}: state was not updated`)
  }
}

// Retrieve enabled stores in their current states
const retrieveStores = async (db: Db): Promise<Store[]> => {
  const stores = await db.collection('stores').find({ enabled: true }).toArray()
  return stores as Store[]
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
