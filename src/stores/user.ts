import { defineStore, acceptHMRUpdate } from 'pinia'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { EventStatus } from 'src/api/model/EventStatus'
import { EventTypes } from 'src/api/model/EventTypes'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import {
  PermissionCodename,
  UserObjectPermissionDto
} from 'src/api/model/UserObjectPermissionDto'
import { computed, ref } from 'vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { ReportChartData } from 'src/api/model/ReportChartData'
import { parseIfPossible } from 'src/utils/json'

export enum SortOption {
  START_DATE_DESC = '-start_date',
  START_DATE_ASC = 'start_date',
  NAME = 'name'
}

export interface EventFilterPreferences {
  subAssociations: number[]
  campaign: number | undefined
  sorting: SortOption
  eventType: EventTypes | undefined
  status: EventStatus | undefined
  is_owner: boolean | undefined
  management_permission: boolean | undefined
}

const KEY_BBOX = 'KEY_BBOX'
const KEY_FILTERPREFERENCES = 'KEY_FILTERPREFERENCES'
const KEY_REPORT_CHARTS = 'KEY_REPORT_CHARTS'
const KEY_PUSH_NOTIFICATIONS = 'KEY_PUSH_NOTIFICATIONS'
const KEY_LOCALE = 'de'
export const DEFAULT_FILTER_PREFERENCES = {
  subAssociations: [],
  campaign: undefined,
  sorting: SortOption.START_DATE_DESC,
  eventType: undefined,
  status: EventStatus.ACTIVE,
  is_owner: undefined,
  management_permission: false
}

export const DEFAULT_USER_STATE = {
  user: null,
  permissions: [],
  bbox: null,
  locale: process.env.APP_LANGUAGE || 'de',
  homeAssociation: null,
  filterPreferences: DEFAULT_FILTER_PREFERENCES,
  reportCharts: [],
  pushNotifications: false
}

export const useUserStore = defineStore('user', () => {
  // Store initialization
  const user = ref<UserDto | null>(DEFAULT_USER_STATE.user)
  const permissions = ref<UserObjectPermissionDto[]>(
    DEFAULT_USER_STATE.permissions
  )
  const bbox = ref<BBox2d | null>(DEFAULT_USER_STATE.bbox)
  const locale = ref<string | null>(DEFAULT_USER_STATE.locale)
  const homeAssociation = ref<SubAssociationDto | null>(
    DEFAULT_USER_STATE.homeAssociation
  )
  const filterPreferences = ref<EventFilterPreferences>(
    DEFAULT_USER_STATE.filterPreferences
  )
  const reportCharts = ref<ReportChartData[]>(DEFAULT_USER_STATE.reportCharts)
  const pushNotifications = ref(DEFAULT_USER_STATE.pushNotifications)

  // Load data from local storage
  if (localStorage.getItem(KEY_BBOX)) {
    bbox.value = JSON.parse(localStorage.getItem(KEY_BBOX))
  }

  if (localStorage.getItem(KEY_REPORT_CHARTS)) {
    reportCharts.value = JSON.parse(localStorage.getItem(KEY_REPORT_CHARTS))
  }

  if (localStorage.getItem(KEY_FILTERPREFERENCES)) {
    const filterPreferencesString = localStorage.getItem(KEY_FILTERPREFERENCES)
    const filterPrefs = parseIfPossible(
      filterPreferencesString
    ) as EventFilterPreferences | null
    filterPreferences.value = filterPrefs ?? DEFAULT_FILTER_PREFERENCES
  }

  if (localStorage.getItem(KEY_PUSH_NOTIFICATIONS)) {
    pushNotifications.value =
      JSON.parse(localStorage.getItem(KEY_PUSH_NOTIFICATIONS)) ?? false
  }

  // Helper functions
  function setBbox(value: BBox2d | null) {
    bbox.value = value
    if (value) {
      localStorage.setItem(KEY_BBOX, JSON.stringify(value))
    } else {
      localStorage.removeItem(KEY_BBOX)
    }
  }

  function setLocale(value: string | null) {
    locale.value = value
    if (value) {
      localStorage.setItem(KEY_LOCALE, value)
    } else {
      localStorage.removeItem(KEY_LOCALE)
    }
  }

  function setFilterPreferences(value: EventFilterPreferences) {
    filterPreferences.value = value
    localStorage.setItem(KEY_FILTERPREFERENCES, JSON.stringify(value))
  }

  function clearFilterPreferences() {
    setFilterPreferences(DEFAULT_FILTER_PREFERENCES)
  }

  function setHomeAssociation(value: SubAssociationDto | null) {
    homeAssociation.value = value
  }

  function setPushNotificationPreferences(value: boolean) {
    pushNotifications.value = value
    localStorage.setItem(KEY_PUSH_NOTIFICATIONS, JSON.stringify(value))
  }

  function clearUser() {
    user.value = null
  }

  function clearHomeAssociation() {
    homeAssociation.value = null
  }

  const isCampaignAdmin = computed(() => {
    return user.value?.roles.includes(CAMPAIGN_ADMIN) ?? false
  })

  const isTeamCaptainOrLocalCoordinator = computed(() => {
    return myPermissions.value.length !== 0
  })

  const myPermissions = computed(() => {
    return permissions.value.filter(
      (permission) => permission.user == user.value?.username
    )
  })

  const myTeamCaptainOrCoordinatorPermissions = computed(() => {
    return myPermissions.value.filter(
      (permission) =>
        permission.permission_codename == PermissionCodename.TEAM_CAPTAIN ||
        permission.permission_codename == PermissionCodename.MANAGE_EVENTS
    )
  })

  function setPermissions(value: UserObjectPermissionDto[]) {
    permissions.value = value
  }

  function setReportCharts(value: ReportChartData[] | null) {
    reportCharts.value = value ? value : []
    if (value) {
      localStorage.setItem(KEY_REPORT_CHARTS, JSON.stringify(value))
    } else {
      localStorage.removeItem(KEY_REPORT_CHARTS)
    }
  }

  const hasAtLeastOneManagePermission = computed(() => {
    if (
      user.value?.roles.includes(CAMPAIGN_ADMIN) ||
      user.value?.is_superuser
    ) {
      return true
    }
    return permissions.value
      .map(({ permission_codename }) => permission_codename)
      .includes(PermissionCodename.MANAGE_EVENTS)
  })

  const isAdminOrGlobalCoordinator = computed(() => {
    if (
      user.value?.roles.includes(CAMPAIGN_ADMIN) ||
      user.value?.is_superuser
    ) {
      return true
    } else {
      return false
    }
  })

  function setUser(value: UserDto) {
    user.value = value
  }

  function $reset() {
    localStorage.removeItem(KEY_REPORT_CHARTS)

    user.value = DEFAULT_USER_STATE.user
    permissions.value = DEFAULT_USER_STATE.permissions
    bbox.value = DEFAULT_USER_STATE.bbox
    locale.value = DEFAULT_USER_STATE.locale
    homeAssociation.value = DEFAULT_USER_STATE.homeAssociation
    filterPreferences.value = DEFAULT_USER_STATE.filterPreferences
    reportCharts.value = DEFAULT_USER_STATE.reportCharts
    pushNotifications.value = DEFAULT_USER_STATE.pushNotifications
  }

  return {
    user,
    permissions,
    bbox,
    locale,
    homeAssociation,
    filterPreferences,
    reportCharts,
    pushNotifications,
    setBbox,
    setLocale,
    setFilterPreferences,
    clearFilterPreferences,
    setHomeAssociation,
    setPushNotificationPreferences,
    clearUser,
    clearHomeAssociation,
    isCampaignAdmin,
    isTeamCaptainOrLocalCoordinator,
    myPermissions,
    myTeamCaptainOrCoordinatorPermissions,
    setPermissions,
    setReportCharts,
    hasAtLeastOneManagePermission,
    isAdminOrGlobalCoordinator,
    setUser,
    $reset
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
