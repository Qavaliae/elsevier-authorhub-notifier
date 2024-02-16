import axios from 'axios'
import { State, StateSummary, Store } from './types'

export const notify = async (store: Store) => {
  const message = composeMessage(store.state)

  for (const listener of store.listeners) {
    switch (listener.channel) {
      case 'telegram':
        const { bot, chatId } = listener
        const url = `https://api.telegram.org/${bot}/sendMessage`

        axios.post(url, {
          chat_id: chatId,
          text: message,
        })

      default:
        console.error('Unsupported channel.')
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
  return {
    ref: state.PubdNumber,
    status: interpretStatus(state.Status),
    reviewsCompleted: 0,
    invitationsAccepted: 1,
    invitationsSent: 4,
  }
}

export const interpretStatus = (status: number): string => {
  switch (status) {
    case 3 | 23:
      return 'Under Review'
    case 4:
      return 'Required Reviews Complete'
    default:
      return 'Unknown'
  }
}
