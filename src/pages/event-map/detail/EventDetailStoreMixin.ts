import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import {
  ObjectPermissionDto,
  ObjectPermissions
} from 'src/api/model/ObjectPermissionDto'
import { Feature } from 'geojson'
import { PosterDto } from 'src/api/model/PosterDto'
import { apiClient } from 'src/api/ApiClient'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, circle } from '@turf/turf'
import { userStore } from 'src/store/UserStore'

export function useEventDetailStore() {
  const zoomBox = computed(() => {
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
      : userStore.getState().bbox
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

  const activePosterIndex = computed({
    get: () => {
      return eventDetailStore.state.activePosterIndex
    },
    set: (index: number | null) => {
      eventDetailStore.state.activePosterIndex = index
    }
  })

  const posters = computed({
    get: () => {
      return eventDetailStore.state.posters
    },
    set: (posters: PosterDto[]) => {
      eventDetailStore.state.posters = posters
    }
  })

  const postersInArea = computed({
    get: () => {
      return eventDetailStore.state.posters.filter(
        ({ area }) => area === (eventArea.value?.id ?? null)
      )
    },
    set: (posters: PosterDto[]) => {
      mergePosters(posters)
    }
  })

  const postersWithoutArea = computed({
    get: () => {
      return eventDetailStore.state.posters.filter(({ area }) => area === null)
    },
    set: (posters: PosterDto[]) => {
      mergePosters(posters)
    }
  })

  const participations = computed({
    get: () => {
      return eventDetailStore.getState().participations
    },
    set: (value: EventParticipationDto[]) => {
      const personalParticipationAlt = value.find(
        ({ id }) => id === personalParticipation.value?.id
      )
      // if the update contains the personal one keep them in sync
      if (personalParticipationAlt) {
        eventDetailStore.setPersonalParticipation(personalParticipationAlt)
      }
      eventDetailStore.setParticipations(value)
    }
  })

  const personalParticipation = computed({
    get: () => {
      return eventDetailStore.getState().personalParticipation
    },
    set: (value: EventParticipationDto | null) => {
      const oldParticipation = personalParticipation.value
      const existingParticipationIndex = participations.value.findIndex(
        ({ id }) => oldParticipation?.id === id
      )
      // keep the participation list in sync
      if (value === null && existingParticipationIndex > -1) {
        eventDetailStore.setParticipations(
          participations.value.filter(({ id }) => oldParticipation?.id !== id)
        )
      } else if (value !== null && existingParticipationIndex > -1) {
        const newParticipations = [...participations.value]
        newParticipations[existingParticipationIndex] = value
        eventDetailStore.setParticipations(newParticipations)
      } else if (value !== null && existingParticipationIndex === -1) {
        eventDetailStore.setParticipations([...participations.value, value])
      }
      eventDetailStore.setPersonalParticipation(value)
    }
  })

  const personalParticipationPermissions = computed(() => {
    return eventDetailStore.getState().personalParticipationPermissions
  })

  const completedTargetIds = computed(() => {
    return eventDetailStore
      .getState()
      .completionNotes.filter(({ completed }) => completed)
      .map(({ target_id }) => target_id)
  })

  const event = computed({
    get: () => {
      return eventDetailStore.getState().event!
    },
    set: (value: EventDto) => {
      eventDetailStore.setEvent(value)
    }
  })

  const eventArea = computed({
    get: () => {
      return eventDetailStore.getEventArea()!
    },
    set: (value: EventAreaDto) => {
      eventDetailStore.setEventArea(value)
    }
  })

  const eventAreas = computed({
    get: () => {
      return eventDetailStore.getState().eventAreas
    },
    set: (value: EventAreaDto[]) => {
      eventDetailStore.setEventAreas(value)
    }
  })

  const eventPermissions = computed({
    get: () => {
      return eventDetailStore.getState().eventPermissions
    },
    set: (value: ObjectPermissionDto | null) => {
      eventDetailStore.setEventPermissions(value)
    }
  })

  const eventAreaPermissions = computed({
    get: () => {
      return eventDetailStore.getState().eventAreaPermissions
    },
    set: (value: PermissionHintsDto | null) => {
      eventDetailStore.setEventAreaPermissions(value)
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

  const deletePostersByIds = (posterIds: number[]) => {
    posters.value = posters.value.filter(({ id }) => !posterIds.includes(id))
  }

  const mergePosters = (newPosters: PosterDto[]) => {
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
  const refreshParticipants = async () => {
    participations.value = (
      await apiClient.eventParticipations.list({
        event: event.value.id
      })
    ).payload.data
  }

  return {
    event,
    eventArea,
    eventAreas,
    areaFeatures,
    eventAreaPermissions,
    completedTargetIds,
    currentAreaFeature,
    isTeamCaptainOrCoordinator,
    personalParticipationPermissions,
    participations,
    personalParticipation,
    refreshParticipants,
    isCoordinator,
    posters,
    postersInArea,
    postersWithoutArea,
    zoomBox,
    mergePosters,
    activePosterIndex,
    deletePostersByIds
  }
}
