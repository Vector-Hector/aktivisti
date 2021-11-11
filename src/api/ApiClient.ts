import { CampaignDto } from 'src/api/model/CampaignDto'
import { CampaignTypeDto } from 'src/api/model/CampaignTypeDto'
import { EventRoute } from 'src/api/EventRoute'
import { ApiRoute } from 'src/api/ApiRoute'
import axios from 'axios'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricRecordSubmissionDto } from 'src/api/model/EventMetricRecordSubmissionDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { TrackingSessionDto } from 'src/api/model/TrackingSessionDto'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { LeadDto } from 'src/api/model/LeadDto'
import { EventAreaRoute } from 'src/api/EventAreaRoute'
import { EventParticipationRoute } from 'src/api/EventParticipationRoute'
import { UserRegistrationDto } from 'src/api/model/UserRegistrationDto'
import { ClusterDto } from 'src/api/model/ClusterDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { AccountRoute } from 'src/api/AccountRoute'
import { EmailNotificationSettingsDto } from 'src/api/model/EmailNotificationSettingsDto'
import { UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import { PersonalMetricsRoute } from 'src/api/PersonalMetricsRoute'
import { TokenRoute } from 'src/api/TokenRoute'
import { ConfigRoute } from 'src/api/ConfigRoute'
import { SessionRoute } from 'src/api/SessionRoute'
import { ForgotPasswordDto } from 'src/api/model/ForgotPasswordDto'
import { ObjectPermissionsRoute } from 'src/api/ObjectPermissionsRoute'
import { UserRoute } from 'src/api/UserRoute'
import { PosterDto } from 'src/api/model/PosterDto'
import { ContentTypeDto } from 'src/api/model/ContentTypeDto'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { AppSessionDto } from 'src/api/model/AppSessionDto'

/**
 * A collection of {@link ApiRoute}s to reflect the whole functioniality of the REST API
 * All backend communication should be done using this class
 */
export class ApiClient {
  baseURL = process.env.APP_BASE_URL!

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  appSessions = new ApiRoute<AppSessionDto>(this.baseURL, 'app-sessions/', this.axiosInstance)
  events = new EventRoute(this.baseURL, 'events/', this.axiosInstance)
  eventAreas = new EventAreaRoute(this.baseURL, 'event-areas/', this.axiosInstance)
  eventMetrics = new ApiRoute<EventMetricDto>(this.baseURL, 'event-metrics/', this.axiosInstance)
  completionNotes = new ApiRoute<CompletionNoteDto>(this.baseURL, 'completion-notes/', this.axiosInstance)
  eventMetricRecords = new ApiRoute<EventMetricRecordDto>(this.baseURL, 'event-metric-records/', this.axiosInstance)
  eventMetricRecordSubmissions = new ApiRoute<EventMetricRecordSubmissionDto>(this.baseURL, 'event-metric-record-submissions/', this.axiosInstance)
  campaigns = new ApiRoute<CampaignDto>(this.baseURL, 'campaigns/', this.axiosInstance)
  user = new UserRoute(this.baseURL, 'users/', this.axiosInstance)
  tokens = new TokenRoute(this.baseURL, 'tokens/', this.axiosInstance)
  personalMetrics = new PersonalMetricsRoute(this.baseURL, 'personal-metrics/', this.axiosInstance)
  userPermissions = new ApiRoute<UserObjectPermissionDto>(this.baseURL, 'user-permissions/', this.axiosInstance)
  campaignTypes = new ApiRoute<CampaignTypeDto>(this.baseURL, 'campaign-types/', this.axiosInstance)
  trackingSession = new ApiRoute<TrackingSessionDto>(this.baseURL, 'tracking-session/', this.axiosInstance)
  leads = new ApiRoute<LeadDto>(this.baseURL, 'leads/', this.axiosInstance)
  eventParticipations = new EventParticipationRoute(this.baseURL, 'event-participations/', this.axiosInstance)
  userRegistration = new ApiRoute<UserRegistrationDto>(this.baseURL, 'account/register/', this.axiosInstance)
  forgotPassword = new ApiRoute<ForgotPasswordDto>(this.baseURL, 'account/forgot-password/', this.axiosInstance)
  eventClusters = new ApiRoute<ClusterDto>(this.baseURL, 'event-clusters/', this.axiosInstance)
  subAssociations = new ApiRoute<SubAssociationDto>(this.baseURL, 'sub-associations/', this.axiosInstance)
  stateAssociations = new ApiRoute<StateAssociationDto>(this.baseURL, 'state-associations/', this.axiosInstance)
  account = new AccountRoute(this.baseURL, 'account/', this.axiosInstance)
  emailNotificationSettings = new ApiRoute<EmailNotificationSettingsDto>(this.baseURL, 'email-notification-settings/', this.axiosInstance)
  session = new SessionRoute(this.baseURL, 'session/', this.axiosInstance)
  config = new ConfigRoute(this.baseURL, 'config/', this.axiosInstance)
  eventPermissions = new ObjectPermissionsRoute(this.baseURL, 'event-permissions/', this.axiosInstance)
  posters = new ApiRoute<PosterDto>(this.baseURL, 'posters/', this.axiosInstance)
  contentTypes = new ApiRoute<ContentTypeDto>(this.baseURL, 'content-types/', this.axiosInstance)
  offices = new ApiRoute<OfficeDto>(this.baseURL, 'offices/', this.axiosInstance)
  officeClusters = new ApiRoute<ClusterDto>(this.baseURL, 'office-clusters/', this.axiosInstance)
}

export const apiClient = new ApiClient()
