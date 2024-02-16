export interface Store {
  _id: {
    $oid: string
  }
  priority: {
    $numberInt: string
  }
  tracker: string
  state: State
  listeners: Listener[]
}

export type Listener = TelegramListener

export interface BaseListener {
  channel: string
}

export interface TelegramListener extends BaseListener {
  channel: 'telegram'
  bot: string
  chatId: string
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
  Event: string
  Revision: number
  Id: number
}

export interface StateSummary {
  ref: string
  status: string
  reviewsCompleted: number
  invitationsAccepted: number
  invitationsSent: number
}
