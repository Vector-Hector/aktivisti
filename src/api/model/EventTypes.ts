export enum EventTypes {
  DOOR_TO_DOOR = 'H',
  POSTERS = 'P',
  GENERIC = 'G',
  FLYERS = 'F'
}

export const eventTypeOptions: { key: string, label: string }[] = [{
  key: EventTypes.DOOR_TO_DOOR,
  label: 'Haustürgespräch'
}, {
  key: EventTypes.POSTERS,
  label: 'Plakate'
}, {
  key: EventTypes.GENERIC,
  label: 'Veranstaltung'
}, {
  key: EventTypes.FLYERS,
  label: 'Flyer'
}
]

export class EventTypesUtil {
  static getLabel(eventType: EventTypes): string {
    return eventTypeOptions.find(({key}) => key === eventType)!.label
  }
}
