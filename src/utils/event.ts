import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'

export function isActiveEvent(event: EventGeoJsonFeature) {
  // ends in the future
  return event.properties.end_date
    ? new Date(event.properties.end_date) > new Date()
    : new Date(event.properties.start_date) > new Date()
}
