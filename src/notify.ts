import axios from 'axios'
import { State, StateSummary, Store } from './types'

export const notify = async (store: Store) => {
  if (!store.state) {
    throw new Error('Cannot notify falsy state.')
  }

  const message = composeMessage(store.state)

  for (const listener of store.listeners) {
    switch (listener.channel) {
      case 'telegram':
        const { bot, chatId } = listener
        const url = `https://api.telegram.org/${bot}/sendMessage`

        await axios.post(url, {
          chat_id: chatId,
          text: message,
        })

        console.log('Notified via Telegram.')
        break

      default:
        console.error('Unsupported channel.')
        break
    }
  }
}

export const composeMessage = (state: State): string => {
  const summary = summarizeState(state)

  return (
    `Ref: ${summary.ref}\n` +
    `Status: ${summary.status}\n` +
    `Reviews completed: ${summary.reviewsCompleted}\n` +
    `Invitations accepted: ${summary.invitationsAccepted}\n` +
    `Invitations sent: ${summary.invitationsSent}`
  )
}

export const summarizeState = (state: State): StateSummary => {
  const revision = state.LatestRevisionNumber
  const events = state.ReviewEvents.filter((e) => e.Revision == revision)

  const reviewsCompleted = events.filter((e) => e.Event.includes('COMPLETE'))

  const invitationsAccepted = events.filter((e) =>
    e.Event.includes('REVIEWER_ACCEPTED'),
  )

  const invitationsSent = events.filter((e) =>
    e.Event.includes('REVIEWER_INVITED'),
  )

  return {
    ref: state.PubdNumber,
    status: interpretStatus(state.Status),
    reviewsCompleted: reviewsCompleted.length,
    invitationsAccepted: invitationsAccepted.length,
    invitationsSent: invitationsSent.length,
  }
}

export const interpretStatus = (status: number): string => {
  switch (status) {
    case 3:
    case 23:
      return 'Under Review'
    case 4:
      return 'Required Reviews Complete'
    default:
      return 'Unknown'
  }
}
