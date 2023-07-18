import { CampaignDto } from 'src/api/model/CampaignDto'
import { CampaignTypeDto } from 'src/api/model/CampaignTypeDto'
import { EventRoute } from 'src/api/EventRoute'
import { ApiRoute } from 'src/api/ApiRoute'
import axios, { AxiosError } from 'axios'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricRecordSubmissionDto } from 'src/api/model/EventMetricRecordSubmissionDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { TrackingSessionDto } from 'src/api/model/TrackingSessionDto'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { LeadDto } from 'src/api/model/LeadDto'
import { EventAreaRoute } from 'src/api/EventAreaRoute'
import { EventParticipationRoute } from 'src/api/EventParticipationRoute'
import { UserRegistrationDto } from 'src/api/model/UserRegistrationDto'
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
import { ContentTypeDto } from 'src/api/model/ContentTypeDto'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { AppSessionDto } from 'src/api/model/AppSessionDto'
import { CampaignGeometriesDto } from 'src/api/model/CampaignGeometriesDto'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { ContactRoute } from 'src/api/ContactRoute'
import { ReportPosterRoute } from 'src/api/ReportPosterRoute'
import { ReportEventMetricsRoute } from 'src/api/ReportEventMetricsRoute'
import { ReportEventsRoute } from 'src/api/ReportEventsRoute'
import { ReportActiveUsersRoute } from 'src/api/ReportActiveUsersRoute'
import { PosterRoute } from 'src/api/PosterRoute'
import { EventGeometryRoute } from 'src/api/EventGeometryRoute'
import { OfficeGeometryRoute } from 'src/api/OfficeGeometryRoute'

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

  isApiClientError(payload: any): payload is AxiosError {
    return axios.isAxiosError(payload)
  }

  appSessions = new ApiRoute<AppSessionDto>(
    this.baseURL,
    'app-sessions/',
    this.axiosInstance
  )
  events = new EventRoute(this.baseURL, 'events/', this.axiosInstance)
  eventAreas = new EventAreaRoute(
    this.baseURL,
    'event-areas/',
    this.axiosInstance
  )
  eventMetrics = new ApiRoute<EventMetricDto>(
    this.baseURL,
    'event-metrics/',
    this.axiosInstance
  )
  completionNotes = new ApiRoute<CompletionNoteDto>(
    this.baseURL,
    'completion-notes/',
    this.axiosInstance
  )
  eventMetricRecords = new ApiRoute<EventMetricRecordDto>(
    this.baseURL,
    'event-metric-records/',
    this.axiosInstance
  )
  eventMetricRecordSubmissions = new ApiRoute<EventMetricRecordSubmissionDto>(
    this.baseURL,
    'event-metric-record-submissions/',
    this.axiosInstance
  )
  campaigns = new ApiRoute<CampaignDto>(
    this.baseURL,
    'campaigns/',
    this.axiosInstance
  )
  user = new UserRoute(this.baseURL, 'users/', this.axiosInstance)
  tokens = new TokenRoute(this.baseURL, 'tokens/', this.axiosInstance)
  personalMetrics = new PersonalMetricsRoute(
    this.baseURL,
    'personal-metrics/',
    this.axiosInstance
  )
  userPermissions = new ApiRoute<UserObjectPermissionDto>(
    this.baseURL,
    'user-permissions/',
    this.axiosInstance
  )
  campaignTypes = new ApiRoute<CampaignTypeDto>(
    this.baseURL,
    'campaign-types/',
    this.axiosInstance
  )
  trackingSession = new ApiRoute<TrackingSessionDto>(
    this.baseURL,
    'tracking-session/',
    this.axiosInstance
  )
  leads = new ApiRoute<LeadDto>(this.baseURL, 'leads/', this.axiosInstance)
  eventParticipations = new EventParticipationRoute(
    this.baseURL,
    'event-participations/',
    this.axiosInstance
  )
  userRegistration = new ApiRoute<UserRegistrationDto>(
    this.baseURL,
    'account/register/',
    this.axiosInstance
  )
  forgotPassword = new ApiRoute<ForgotPasswordDto>(
    this.baseURL,
    'account/forgot-password/',
    this.axiosInstance
  )
  eventGeometry = new EventGeometryRoute(
    this.baseURL,
    'event-geometry/',
    this.axiosInstance
  )
  subAssociations = new ApiRoute<SubAssociationDto>(
    this.baseURL,
    'sub-associations/',
    this.axiosInstance
  )
  stateAssociations = new ApiRoute<StateAssociationDto>(
    this.baseURL,
    'state-associations/',
    this.axiosInstance
  )
  account = new AccountRoute(this.baseURL, 'account/', this.axiosInstance)
  emailNotificationSettings = new ApiRoute<EmailNotificationSettingsDto>(
    this.baseURL,
    'email-notification-settings/',
    this.axiosInstance
  )
  session = new SessionRoute(this.baseURL, 'session/', this.axiosInstance)
  config = new ConfigRoute(this.baseURL, 'config/', this.axiosInstance)
  eventPermissions = new ObjectPermissionsRoute(
    this.baseURL,
    'event-permissions/',
    this.axiosInstance
  )
  posters = new PosterRoute(this.baseURL, 'posters/', this.axiosInstance)
  contentTypes = new ApiRoute<ContentTypeDto>(
    this.baseURL,
    'content-types/',
    this.axiosInstance
  )
  offices = new ApiRoute<OfficeDto>(
    this.baseURL,
    'offices/',
    this.axiosInstance
  )
  officeGeometry = new OfficeGeometryRoute(
    this.baseURL,
    'office-geometry/',
    this.axiosInstance
  )
  campaignGeometries = new ApiRoute<CampaignGeometriesDto>(
    this.baseURL,
    'campaign-geometries/',
    this.axiosInstance
  )
  campaignGeometryCollections = new ApiRoute<CampaignGeometryCollectionsDto>(
    this.baseURL,
    'campaign-geometry-collections/',
    this.axiosInstance
  )
  contact = new ContactRoute(this.baseURL, 'contact/', this.axiosInstance)
  reportPoster = new ReportPosterRoute(
    this.baseURL,
    'report/poster/',
    this.axiosInstance
  )
  reportEventMetrics = new ReportEventMetricsRoute(
    this.baseURL,
    'report/metrics/',
    this.axiosInstance
  )
  reportEvents = new ReportEventsRoute(
    this.baseURL,
    'report/events/',
    this.axiosInstance
  )
  reportActiveUsers = new ReportActiveUsersRoute(
    this.baseURL,
    'report/active-users/',
    this.axiosInstance
  )
}

export const apiClient = new ApiClient()
