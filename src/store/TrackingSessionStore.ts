import { Store } from 'src/store/Store'
import { apiClient } from 'src/api/ApiClient'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'


interface TrackingSessionState {
  trackingSessionId: string | null,
  sessions: { [trackingSessionId: string]: TrackingSession }
}

export interface MetricValueMap {
  [key: string]: number
}

interface TrackingSession {
  id: string
  eventAreas: {
    [eventArea: string]: {
      [address: string]: MetricValueMap
    }
  }
}

class TrackingSessionStore extends Store<TrackingSessionState> {
  private localStorageMetricsPrefix = 'metrics'
  private localStorageSessionIdKey = 'trackingSessionId'

  constructor() {
    super()
    this.loadTrackingSessionStoreFromLocalStorage()
  }

  protected data(): TrackingSessionState {
    return {
      trackingSessionId: null,
      sessions: {}
    }
  }

  private toLocalStorageIdentifier(eventArea: number, address: string) {
    return escape(`${this.localStorageMetricsPrefix}.${eventArea}.${this.getState().trackingSessionId}.${address}`)
  }

  private loadTrackingSessionStoreFromLocalStorage() {
    this.state.trackingSessionId = localStorage.getItem(this.localStorageSessionIdKey) ?? null

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.localStorageMetricsPrefix)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, eventAreaId, trackingSessionId, address] = unescape(key).split('.')
        if (!(trackingSessionId in this.state.sessions)) {
          this.state.sessions[trackingSessionId] = {
            id: trackingSessionId,
            eventAreas: {}
          }
        }
        if (!(eventAreaId in this.state.sessions[trackingSessionId].eventAreas)) {
          this.state.sessions[trackingSessionId].eventAreas[eventAreaId] = {}
        }
        if (!(address in this.state.sessions[trackingSessionId].eventAreas[eventAreaId])) {
          this.state.sessions[trackingSessionId].eventAreas[eventAreaId][address] = {}
        }
        this.state.sessions[trackingSessionId].eventAreas[eventAreaId][address] = JSON.parse(localStorage.getItem(key)!)
      }
    }
  }

  private storeAddressInLocalStorage(
    eventArea: number,
    address: string,
    metricValueMap: MetricValueMap
  ) {
    localStorage.setItem(this.toLocalStorageIdentifier(eventArea, address), JSON.stringify(metricValueMap))
  }

  public clear() {
    this.state.sessions = {}
    this.state.trackingSessionId = null
    for (const key of Object.keys(localStorage)) {
      if (key === this.localStorageSessionIdKey || key.startsWith(this.localStorageMetricsPrefix)) {
        localStorage.removeItem(key)
      }
    }
  }

  getMetricsForAddress(eventArea: number, address: AddressDetails): MetricValueMap | undefined {
    if (this.state.trackingSessionId !== null) {
      try {
        return this.state.sessions[this.state.trackingSessionId].eventAreas[eventArea][address.osm_id]
      } catch (e) {
        // If TypeError arises there is no record yet
        return undefined
      }
    }
  }

  private async renewTrackingId() {
    const trackingSessionRequest = await apiClient.trackingSession.create({})
    this.state.trackingSessionId = trackingSessionRequest.payload.data.id
    localStorage.setItem(this.localStorageSessionIdKey, this.state.trackingSessionId)
    this.state.sessions[this.state.trackingSessionId] = {
      id: this.state.trackingSessionId,
      eventAreas: {}
    }
  }

  private aggregateForMetricRecordAndEventArea(eventArea: number, metricRecordId: number) {
    return Object.entries(this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea])
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .reduce((acc, [_, valueMap]) => {
        return acc + valueMap[metricRecordId]
      }, 0)
  }

  async updateMetricsForAddress(eventArea: number, address: AddressDetails, metricValueMap: MetricValueMap) {
    if (this.state.trackingSessionId === null) {
      await this.renewTrackingId()
    }
    const metricsToUpdate: { metricRecordId: string, value: number }[] = []
    // set a flag indicating that before this update no metrics were recorded
    let fromIncompleteState = true

    const oldMetrics = this.state.sessions[this.state.trackingSessionId!]?.eventAreas[eventArea]?.[address.osm_id]
    if (oldMetrics) {
      for (const [metricId, value] of Object.entries(oldMetrics)) {
        if (value > 0) {
          // if any value before this update was >0 this address was indicated as completed already
          fromIncompleteState = false
        }
        if (metricValueMap[metricId] !== value) {
          metricsToUpdate.push({metricRecordId: metricId, value: metricValueMap[metricId]})
        }
      }
    } else {
      // No metrics are recorded yet, assume a fresh submission
      metricsToUpdate.push(...Object.entries(metricValueMap).map(([metricRecordId, value]) => {
        return {
          metricRecordId,
          value
        }
      }))
    }
    if (!(eventArea in this.state.sessions[this.state.trackingSessionId!].eventAreas)) {
      this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea] = {}
    }
    this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea][address.osm_id] = metricValueMap
    this.storeAddressInLocalStorage(eventArea, address.osm_id, metricValueMap)
    const updatePromises: Promise<any>[] = []
    for (const metric of metricsToUpdate) {
      const metricId = parseInt(metric.metricRecordId)
      const aggregatedMetricValue = this.aggregateForMetricRecordAndEventArea(eventArea, metricId)
      updatePromises.push(apiClient.eventMetricRecordSubmissions.create({
        metric_record: parseInt(metric.metricRecordId),
        event_area: eventArea,
        value: aggregatedMetricValue,
        tracking_session: this.state.trackingSessionId!
      }))
    }
    // If we updated this address to only record zeroes that means we mark this address as incomplete
    const toIncompleteState = metricsToUpdate.reduce((acc, item) => item.value + acc, 0) == 0
    if (fromIncompleteState || toIncompleteState) {
      // If there is any metric recorded for this address indicate completion to the backend, if not indicate incompletion
      const completed = metricsToUpdate.some(({value}) => value > 0)
      updatePromises.push(apiClient.completionNotes.create({
        target_id: address.osm_id,
        completed: completed,
        event_area: eventArea
      }))
    }
    await Promise.all(updatePromises)

  }
}

export const trackingSessionStore = new TrackingSessionStore()
