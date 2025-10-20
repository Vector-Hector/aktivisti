import { defineStore, acceptHMRUpdate } from 'pinia'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import {
  ObjectPermissionDto,
  ObjectPermissions
} from 'src/api/model/ObjectPermissionDto'
import { PosterDto } from 'src/api/model/PosterDto'
import { computed, ref } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, circle } from '@turf/turf'
import { useUserStore } from './user'
import { Feature } from 'geojson'

const DEAFULT_EVENT_DETAIL_STATE = {
  event: null,
  eventAreas: [],
  eventAreaPermissions: null,
  participations: [],
  personalParticipation: null,
  personalParticipationPermissions: null,
  campaigns: [],
  eventPermissions: null,
  completionNotes: [],
  selectedEventAreaId: null,
  posters: [],
  activePosterIndex: null
}

export const useEventStore = defineStore('eventDetail', () => {
  const event = ref<EventDto | null>(DEAFULT_EVENT_DETAIL_STATE.event)
  const eventAreas = ref<EventAreaDto[]>(DEAFULT_EVENT_DETAIL_STATE.eventAreas)
  const eventAreaPermissions = ref<PermissionHintsDto | null>(
    DEAFULT_EVENT_DETAIL_STATE.eventAreaPermissions
  )
  const participations = ref<EventParticipationDto[]>(
    DEAFULT_EVENT_DETAIL_STATE.participations
  )
  const personalParticipation = ref<EventParticipationDto | null>(
    DEAFULT_EVENT_DETAIL_STATE.personalParticipation
  )
  const personalParticipationPermissions = ref<PermissionHintsDto | null>(
    DEAFULT_EVENT_DETAIL_STATE.personalParticipationPermissions
  )
  const campaigns = ref<CampaignDto[]>(DEAFULT_EVENT_DETAIL_STATE.campaigns)
  const eventPermissions = ref<ObjectPermissionDto | null>(
    DEAFULT_EVENT_DETAIL_STATE.eventPermissions
  )
  const completionNotes = ref<CompletionNoteDto[]>(
    DEAFULT_EVENT_DETAIL_STATE.completionNotes
  )
  const selectedEventAreaId = ref<null | number>(
    DEAFULT_EVENT_DETAIL_STATE.selectedEventAreaId
  )
  const posters = ref<PosterDto[]>(DEAFULT_EVENT_DETAIL_STATE.posters)
  const activePosterIndex = ref<number | null>(
    DEAFULT_EVENT_DETAIL_STATE.activePosterIndex
  )

  function setEvent(value: EventDto | null) {
    event.value = value
  }

  function getEventArea(): EventAreaDto | null {
    return (
      eventAreas.value.find(({ id }) => id === selectedEventAreaId.value) ??
      null
    )
  }

  function updateEventArea(value: EventAreaDto) {
    const indexToReplace = eventAreas.value.findIndex(
      ({ id }) => value.id === id
    )
    eventAreas.value[indexToReplace] = value
  }

  function setEventArea(value: EventAreaDto | null) {
    if (value) {
      updateEventArea(value)
    }
    selectedEventAreaId.value = value?.id ?? null
  }

  function setEventAreaPermissions(value: PermissionHintsDto | null) {
    eventAreaPermissions.value = value
  }

  function setParticipations(value: EventParticipationDto[]) {
    participations.value = value
  }

  function setPersonalParticipation(value: EventParticipationDto | null) {
    personalParticipation.value = value
  }

  function setPersonalParticipationPermissions(
    value: PermissionHintsDto | null
  ) {
    personalParticipationPermissions.value = value
  }

  function setEventAreas(value: EventAreaDto[]) {
    eventAreas.value = value
  }

  function setEventPermissions(value: ObjectPermissionDto | null) {
    eventPermissions.value = value
  }

  function setCampaigns(value: CampaignDto[]) {
    campaigns.value = value
  }

  function addCompletionNotes(value: CompletionNoteDto[]) {
    const newIds = value.map(({ target_id }) => target_id)
    // discard any in the current set that are added with this new set
    completionNotes.value = [
      ...completionNotes.value.filter(
        ({ target_id }) => !newIds.includes(target_id)
      ),
      ...value
    ]
  }

  function $reset() {
    event.value = DEAFULT_EVENT_DETAIL_STATE.event
    eventAreas.value = DEAFULT_EVENT_DETAIL_STATE.eventAreas
    eventAreaPermissions.value = DEAFULT_EVENT_DETAIL_STATE.eventAreaPermissions
    participations.value = DEAFULT_EVENT_DETAIL_STATE.participations
    personalParticipation.value =
      DEAFULT_EVENT_DETAIL_STATE.personalParticipation
    personalParticipationPermissions.value =
      DEAFULT_EVENT_DETAIL_STATE.personalParticipationPermissions
    campaigns.value = DEAFULT_EVENT_DETAIL_STATE.campaigns
    eventPermissions.value = DEAFULT_EVENT_DETAIL_STATE.eventPermissions
    completionNotes.value = DEAFULT_EVENT_DETAIL_STATE.completionNotes
    selectedEventAreaId.value = DEAFULT_EVENT_DETAIL_STATE.selectedEventAreaId
    posters.value = DEAFULT_EVENT_DETAIL_STATE.posters
    activePosterIndex.value = DEAFULT_EVENT_DETAIL_STATE.activePosterIndex
  }

  const eventArea = computed({
    get: () => {
      return getEventArea()!
    },
    set: (value: EventAreaDto) => {
      setEventArea(value)
    }
  })

  const areaFeatures = computed(() => {
    return eventAreas.value.map((area) => {
      return {
        type: 'Feature',
        id: area.feature_id,
        geometry: area.geometry,
        properties: {
          color: area.color
        }
      } as Feature
    })
  })

  const zoomBox = computed(() => {
    const userStore = useUserStore()
    const locationFeatures = [...areaFeatures.value]
    if (event.value?.location) {
      locationFeatures.push(
        circle([event.value.location.lng, event.value.location.lat], 0.2)
      )
    }
    return locationFeatures.length > 0
      ? (bbox({
          type: 'FeatureCollection',
          features: [...areaFeatures.value, ...locationFeatures]
        }) as BBox2d)
      : userStore.bbox
  })

  const completedTargetIds = computed(() => {
    return completionNotes.value
      .filter(({ completed }) => completed)
      .map(({ target_id }) => target_id)
  })

  const currentAreaFeature = computed(() => {
    if (!eventArea.value) return undefined
    return {
      type: 'Feature',
      geometry: eventArea.value.geometry,
      properties: {
        color: eventArea.value.color
      }
    } as Feature
  })

  function deletePostersByIds(posterIds: number[]) {
    posters.value = posters.value.filter(({ id }) => !posterIds.includes(id))
  }

  function mergePosters(newPosters: PosterDto[]) {
    for (const poster of newPosters) {
      const originalIndex = posters.value.findIndex(
        ({ id }) => id === poster.id
      )
      if (originalIndex > -1) {
        Object.assign(posters.value[originalIndex], poster)
      } else {
        posters.value.push(poster)
      }
    }
  }

  const postersInArea = computed({
    get: () => {
      return posters.value.filter(
        ({ area }) => area === (eventArea.value?.id ?? null)
      )
    },
    set: (posters: PosterDto[]) => {
      mergePosters(posters)
    }
  })

  const isTeamCaptain = computed(() => {
    return (
      eventPermissions.value?.permissions?.includes(
        ObjectPermissions.TeamCaptain
      ) ?? false
    )
  })

  const isCoordinator = computed(() => {
    return (
      eventPermissions.value?.permissions?.includes(
        ObjectPermissions.Coordinator
      ) ?? false
    )
  })

  const isTeamCaptainOrCoordinator = computed(() => {
    return isTeamCaptain.value || isCoordinator.value
  })

  return {
    event,
    eventAreas,
    eventAreaPermissions,
    participations,
    personalParticipation,
    personalParticipationPermissions,
    campaigns,
    eventPermissions,
    completionNotes,
    selectedEventAreaId,
    posters,
    activePosterIndex,
    eventArea,
    areaFeatures,
    zoomBox,
    completedTargetIds,
    currentAreaFeature,
    postersInArea,
    isCoordinator,
    isTeamCaptainOrCoordinator,
    setEvent,
    getEventArea,
    updateEventArea,
    setEventArea,
    setEventAreaPermissions,
    setParticipations,
    setPersonalParticipation,
    setPersonalParticipationPermissions,
    setEventAreas,
    setEventPermissions,
    setCampaigns,
    addCompletionNotes,
    $reset,
    deletePostersByIds,
    mergePosters
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventStore, import.meta.hot))
}
