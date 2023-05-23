export enum EventStatus {
  ACTIVE = 'active',
  ENDED = 'ended'
}

export const eventStatusOptions: { key: string; label: string }[] = [
  {
    key: EventStatus.ACTIVE,
    label: 'aktuell'
  },
  {
    key: EventStatus.ENDED,
    label: 'beendet'
  }
]
