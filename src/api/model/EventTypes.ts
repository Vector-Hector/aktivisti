export enum EventTypes {
  DOOR_TO_DOOR = 'H',
  POSTERS = 'P'
}

export const eventTypeOptions: { key: string, label: string }[] = [{
  key: EventTypes.DOOR_TO_DOOR,
  label: 'Haustürgespräch'
}, {
  key: EventTypes.POSTERS,
  label: 'Poster'
}]

