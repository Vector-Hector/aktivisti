import { CampaignDto } from '@/api/model/CampaignDto'
import { UserDto } from '@/api/model/UserDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { EventRoute } from '@/api/EventRoute'
import { ApiRoute } from '@/api/ApiRoute'
import axios from 'axios'
import { userStore } from '@/store/UserStore'
import { EventAreaDto } from '@/api/model/EventAreaDto'

/**
 * A collection of {@link ApiRoute}s to reflect the whole functioniality of the REST API
 * All backend communication should be done using this class
 */
export class ApiClient {
  baseURL = `${process.env.VUE_APP_BASE_URL}`

  axiosInstance = axios.create({
    baseURL: this.baseURL,
    headers: {
      'Authorization': `Bearer ${userStore.getToken()}`,
      'Content-Type': 'application/json'
    }
  })

  events = new EventRoute(this.baseURL, 'events', this.axiosInstance)
  eventAreas = new ApiRoute<EventAreaDto>(this.baseURL, 'event-areas', this.axiosInstance)
  campaign = new ApiRoute<CampaignDto>(this.baseURL, 'campaigns', this.axiosInstance)
  user = new ApiRoute<UserDto>(this.baseURL, 'users', this.axiosInstance)
  campaignTypes = new ApiRoute<CampaignTypeDto>(this.baseURL, 'campaign-types', this.axiosInstance)
  organizationTypes = new ApiRoute<OrganizationTypeDto>(this.baseURL, 'organization-types', this.axiosInstance)
}
