import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
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
import { useUserStore } from 'src/stores/user'
import { useEventStore } from 'src/stores/event'

export function useEventDetailStore() {
  const eventStore = useEventStore()
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
      return eventStore.activePosterIndex
    },
    set: (index: number | null) => {
      eventStore.activePosterIndex = index
    }
  })

  const posters = computed({
    get: () => {
      return eventStore.posters
    },
    set: (posters: PosterDto[]) => {
      eventStore.posters = posters
    }
  })

  const postersInArea = computed({
    get: () => {
      return eventStore.posters.filter(
        ({ area }) => area === (eventArea.value?.id ?? null)
      )
    },
    set: (posters: PosterDto[]) => {
      mergePosters(posters)
    }
  })

  const postersWithoutArea = computed({
    get: () => {
      return eventStore.posters.filter(({ area }) => area === null)
    },
    set: (posters: PosterDto[]) => {
      mergePosters(posters)
    }
  })

  const participations = computed({
    get: () => {
      return eventStore.participations
    },
    set: (value: EventParticipationDto[]) => {
      const personalParticipationAlt = value.find(
        ({ id }) => id === personalParticipation.value?.id
      )
      // if the update contains the personal one keep them in sync
      if (personalParticipationAlt) {
        eventStore.setPersonalParticipation(personalParticipationAlt)
      }
      eventStore.setParticipations(value)
    }
  })

  const personalParticipation = computed({
    get: () => {
      return eventStore.personalParticipation
    },
    set: (value: EventParticipationDto | null) => {
      const oldParticipation = personalParticipation.value
      const existingParticipationIndex = participations.value.findIndex(
        ({ id }) => oldParticipation?.id === id
      )
      // keep the participation list in sync
      if (value === null && existingParticipationIndex > -1) {
        eventStore.setParticipations(
          participations.value.filter(({ id }) => oldParticipation?.id !== id)
        )
      } else if (value !== null && existingParticipationIndex > -1) {
        const newParticipations = [...participations.value]
        newParticipations[existingParticipationIndex] = value
        eventStore.setParticipations(newParticipations)
      } else if (value !== null && existingParticipationIndex === -1) {
        eventStore.setParticipations([...participations.value, value])
      }
      eventStore.setPersonalParticipation(value)
    }
  })

  const personalParticipationPermissions = computed(() => {
    return eventStore.personalParticipationPermissions
  })

  const completedTargetIds = computed(() => {
    return eventStore.completionNotes
      .filter(({ completed }) => completed)
      .map(({ target_id }) => target_id)
  })

  const event = computed({
    get: () => {
      return eventStore.event!
    },
    set: (value: EventDto) => {
      eventStore.setEvent(value)
    }
  })

  const eventArea = computed({
    get: () => {
      return eventStore.getEventArea()!
    },
    set: (value: EventAreaDto) => {
      eventStore.setEventArea(value)
    }
  })

  const eventAreas = computed({
    get: () => {
      return eventStore.eventAreas
    },
    set: (value: EventAreaDto[]) => {
      eventStore.setEventAreas(value)
    }
  })

  const eventPermissions = computed({
    get: () => {
      return eventStore.eventPermissions
    },
    set: (value: ObjectPermissionDto | null) => {
      eventStore.setEventPermissions(value)
    }
  })

  const eventAreaPermissions = computed({
    get: () => {
      return eventStore.eventAreaPermissions
    },
    set: (value: PermissionHintsDto | null) => {
      eventStore.setEventAreaPermissions(value)
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
