import { Store } from '@/store/Store'
import { apiClient } from '@/api/ApiClient'


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

  getMetricsForAddress(eventArea: number, address: string): MetricValueMap | undefined {
    if (this.state.trackingSessionId !== null) {
      try {
        return this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea][address]
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

  async collectMetricsForAddress(eventArea: number, address: string, metricValueMap: MetricValueMap) {
    if (this.state.trackingSessionId === null) {
      await this.renewTrackingId()
    }
    const metricsToUpdate: { metricRecordId: string, value: number }[] = []
    try {
      const oldMetrics = this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea][address]
      for (const [metricId, value] of Object.entries(oldMetrics)) {
        if (metricValueMap[metricId] !== value) {
          metricsToUpdate.push({metricRecordId: metricId, value: metricValueMap[metricId]})
        }
      }
    } catch (e) { // ignore type error and assume no metrics were recorded yet, so all metrics will be reported
      metricsToUpdate.push(...Object.entries(metricValueMap).map(([metricRecordId, value]) => {
        return {
          metricRecordId,
          value
        }
      }))
    }

    for (const metric of metricsToUpdate) {
      await apiClient.eventMetricRecordSubmissions.create({
        metric_record: parseInt(metric.metricRecordId),
        event_area: eventArea,
        value: metric.value,
        tracking_session: this.state.trackingSessionId!
      })
      this.storeAddressInLocalStorage(eventArea, address, metricValueMap)
      if (!(eventArea in this.state.sessions[this.state.trackingSessionId!].eventAreas)) {
        this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea] = {}
      }
      this.state.sessions[this.state.trackingSessionId!].eventAreas[eventArea][address] = metricValueMap
    }
  }
}

export const trackingSessionStore = new TrackingSessionStore()
