import { CampaignDto } from '@/api/model/CampaignDto'
import { UserDto } from '@/api/model/UserDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { EventRoute } from '@/api/EventRoute'
import { ApiRoute } from '@/api/ApiRoute'
import { EventAreaDto } from '@/api/model/EventAreaDto'

/**
 * A collection of {@link ApiRoute}s to reflect the whole functioniality of the REST API
 * All backend communication should be done using this class
 */
export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}`

  eventAreas = new ApiRoute<EventAreaDto>(this.baseURL, 'event-areas')
  events = new EventRoute(this.baseURL, 'events')
  campaign = new ApiRoute<CampaignDto>(this.baseURL, 'campaigns')
  user = new ApiRoute<UserDto>(this.baseURL, 'users')
  campaignTypes = new ApiRoute<CampaignTypeDto>(this.baseURL, 'campaign-types')
  organizationTypes = new ApiRoute<OrganizationTypeDto>(this.baseURL, 'organization-types')
}
