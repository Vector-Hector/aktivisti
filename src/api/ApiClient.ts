import { CampaignDto } from '@/api/model/CampaignDto'
import { UserDto } from '@/api/model/UserDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { EventRoute } from '@/api/EventRoute'
import { ApiRoute } from '@/api/ApiRoute'
import axios from 'axios'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { EventMetricRecordSubmissionDto } from '@/api/model/EventMetricRecordSubmissionDto'
import { EventMetricDto } from '@/api/model/EventMetricDto'
import { TrackingSessionDto } from '@/api/model/TrackingSessionDto'
import { CompletionNoteDto } from '@/api/model/CompletionNoteDto'
import { LeadDto } from '@/api/model/LeadDto'
import { EventDto } from '@/api/model/EventDto'
import { EventParticipationRoute } from '@/api/EventParticipationRoute'

/**
 * A collection of {@link ApiRoute}s to reflect the whole functioniality of the REST API
 * All backend communication should be done using this class
 */
export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}`

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  myEvents = new ApiRoute<EventDto>(this.baseURL, 'my-events/', this.axiosInstance)
  events = new EventRoute(this.baseURL, 'events/', this.axiosInstance)
  eventAreas = new ApiRoute<EventAreaDto>(this.baseURL, 'event-areas/', this.axiosInstance)
  eventMetrics = new ApiRoute<EventMetricDto>(this.baseURL, 'event-metrics/', this.axiosInstance)
  completionNotes = new ApiRoute<CompletionNoteDto>(this.baseURL, 'completion-notes/', this.axiosInstance)
  eventMetricRecords = new ApiRoute<EventMetricRecordDto>(this.baseURL, 'event-metric-records/', this.axiosInstance)
  eventMetricRecordSubmissions = new ApiRoute<EventMetricRecordSubmissionDto>(this.baseURL, 'event-metric-record-submissions/', this.axiosInstance)
  campaigns = new ApiRoute<CampaignDto>(this.baseURL, 'campaigns/', this.axiosInstance)
  user = new ApiRoute<UserDto>(this.baseURL, 'users/', this.axiosInstance)
  campaignTypes = new ApiRoute<CampaignTypeDto>(this.baseURL, 'campaign-types/', this.axiosInstance)
  trackingSession = new ApiRoute<TrackingSessionDto>(this.baseURL, 'tracking-session/', this.axiosInstance)
  leads = new ApiRoute<LeadDto>(this.baseURL, 'leads/', this.axiosInstance)
  eventParticipations = new EventParticipationRoute(this.baseURL, 'event-participations/', this.axiosInstance)
}

export const apiClient = new ApiClient()
