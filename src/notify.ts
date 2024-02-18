import axios from 'axios'
import { ReviewEventName, State, StateSummary, Store } from './types'
import { config } from './config'
import { mailer } from './utils/mailer'

export const notify = async (store: Store) => {
  if (!store.state) {
    throw new Error(`${store._id}: cannot notify falsy state`)
  }

  const message = composeMessage(store.state)

  for (const listener of store.listeners.filter((e) => e.enabled)) {
    switch (listener.channel) {
      case 'telegram':
        const { bot, chatId } = listener
        const url = `https://api.telegram.org/${bot}/sendMessage`

        await axios.post(url, {
          chat_id: chatId,
          text: message,
        })

        console.log(`${store._id}: notified via telegram`)
        break

      case 'mail':
        const { email } = listener

        await mailer
          .sendMail({
            from: {
              name: 'Elsevier AuthorHub',
              address: config.mailer.user,
            },
            to: email,
            subject: 'Notification',
            text: message,
          })
          .catch(() => {})

        console.log(`${store._id}: notified via email`)
        break

      default:
        console.error(`${store._id}: unsupported channel`)
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

  const reviewsCompleted = events.filter((e) =>
    e.Event.includes(ReviewEventName.ReviewerCompleted),
  )

  const invitationsAccepted = events.filter(
    (e) =>
      e.Event.includes(ReviewEventName.ReviewerAccepted) ||
      e.Event.includes(ReviewEventName.ReviewerAssigned),
  )

  const invitationsSent = events.filter((e) =>
    e.Event.includes(ReviewEventName.ReviewerInvited),
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
