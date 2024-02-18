import { ObjectId } from 'mongodb'

export interface Store {
  _id: ObjectId
  enabled: boolean
  tracker: string
  state?: State
  listeners: Listener[]
}

export type Listener = TelegramListener | MailListener

export interface BaseListener {
  channel: string
  enabled: boolean
}

export interface TelegramListener extends BaseListener {
  channel: 'telegram'
  bot: string
  chatId: string
}

export interface MailListener extends BaseListener {
  channel: 'mail'
  email: string
}

export interface State {
  Uuid: string
  CorrespondingAuthor: string
  DocumentId: number
  FirstAuthor: string
  JournalAcronym: string
  JournalName: string
  LastUpdated: number
  LatestRevisionNumber: number
  ManuscriptTitle: string
  PubdNumber: string
  ReviewEvents: ReviewEvent[]
  Status: number
  SubmissionDate: number
}

export interface ReviewEvent {
  Date: number
  Event: ReviewEventName
  Revision: number
  Id: number
}

export enum ReviewEventName {
  ReviewerCompleted = 'REVIEWER_COMPLETED',
  ReviewerAssigned = 'REVIEWER_ASSIGNED_NOT_INVITED',
  ReviewerAccepted = 'REVIEWER_ACCEPTED',
  ReviewerInvited = 'REVIEWER_INVITED',
}

export interface StateSummary {
  ref: string
  status: string
  reviewsCompleted: number
  invitationsAccepted: number
  invitationsSent: number
}
