import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { ObjectPermissionDto, ObjectPermissions } from 'src/api/model/ObjectPermissionDto'
import { Feature } from 'geojson'
import { PosterDto } from 'src/api/model/PosterDto'
import { apiClient } from 'src/api/ApiClient'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, circle } from '@turf/turf'
import { userStore } from 'src/store/UserStore'

export default defineComponent({
  name: 'EventDetailStoreMixin',
  computed: {
    zoomBox(): BBox2d | null {
      const locationFeatures = [...this.areaFeatures]
      if (this?.event?.location) {
        locationFeatures.push(circle([this.event.location.lng, this.event.location.lat], 0.2))
      }
      return locationFeatures.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: [...this.areaFeatures, ...locationFeatures]
      }) as BBox2d : userStore.getState().bbox
    },
    areaFeatures(): Feature[] {
      return this.eventAreas.map((area) => {
        return {
          type: 'Feature',
          id: area.feature_id,
          geometry: area.geometry,
          properties: {
            color: area.color
          }
        }
      })
    },
    currentAreaFeature(): Feature | undefined {
      if (!this.eventArea) return undefined
      return {
        type: 'Feature',
        geometry: this.eventArea.geometry,
        properties: {
          color: this.eventArea.color
        }
      }
    },
    activePosterIndex: {
      get() {
        return eventDetailStore.state.activePosterIndex
      },
      set(index: number) {
        eventDetailStore.state.activePosterIndex = index
      }
    },
    posters: {
      get(): PosterDto[] {
        return eventDetailStore.state.posters
      },
      set(posters: PosterDto[]) {
        eventDetailStore.state.posters = posters
      }
    },
    postersInArea: {
      get(): PosterDto[] {
        return eventDetailStore.state.posters.filter(({area}) => area === (this.eventArea?.id ?? null))
      },
      set(posters: PosterDto[]) {
        this.mergePosters(posters)
      }
    },
    postersWithoutArea: {
      get(): PosterDto[] {
        return eventDetailStore.state.posters.filter(({area}) => area === null)
      },
      set(posters: PosterDto[]) {
        this.mergePosters(posters)
      }
    },
    participations: {
      get(): EventParticipationDto[] {
        return eventDetailStore.getState().participations
      },
      set(value: EventParticipationDto[]) {
        const personalParticipation = value.find(({id}) => id === this.personalParticipation?.id)
        // if the update contains the personal one keep them in sync
        if (personalParticipation) {
          eventDetailStore.setPersonalParticipation(personalParticipation)
        }
        eventDetailStore.setParticipations(value)
      }
    },
    personalParticipation: {
      get(): EventParticipationDto | null {
        return eventDetailStore.getState().personalParticipation
      },
      set(value: EventParticipationDto | null) {
        const oldParticipation = this.personalParticipation
        const existingParticipationIndex = this.participations.findIndex(({id}) => oldParticipation?.id === id)
        // keep the participation list in sync
        if (value === null && existingParticipationIndex > -1) {
          eventDetailStore.setParticipations(this.participations.filter(({id}) => oldParticipation?.id !== id))
        } else if (value !== null && existingParticipationIndex > -1) {
          const newParticipations = [...this.participations]
          newParticipations[existingParticipationIndex] = value
          eventDetailStore.setParticipations(newParticipations)
        } else if (value !== null && existingParticipationIndex === -1) {
          eventDetailStore.setParticipations([...this.participations, value])
        }
        eventDetailStore.setPersonalParticipation(value)
      }
    },
    personalParticipationPermissions(): PermissionHintsDto | null {
      return eventDetailStore.getState().personalParticipationPermissions
    },
    completionNotes(): CompletionNoteDto[] {
      return eventDetailStore.getState().completionNotes
    },
    completedTargetIds(): string[] {
      return eventDetailStore.getState().completionNotes
        .filter(({completed}) => completed)
        .map(({target_id}) => target_id)
    },
    event: {
      get(): EventDto {
        return eventDetailStore.getState().event!
      },
      set(value: EventDto) {
        eventDetailStore.setEvent(value)
      }
    },
    eventArea: {
      get(): EventAreaDto {
        return eventDetailStore.getEventArea()!
      },
      set(value: EventAreaDto) {
        eventDetailStore.setEventArea(value)
      }
    },
    eventAreas: {
      get(): EventAreaDto[] {
        return eventDetailStore.getState().eventAreas
      },
      set(value: EventAreaDto[]) {
        eventDetailStore.setEventAreas(value)
      }
    },
    eventPermissions: {
      get(): ObjectPermissionDto | null {
        return eventDetailStore.getState().eventPermissions
      },
      set(value: ObjectPermissionDto) {
        eventDetailStore.setEventPermissions(value)
      }
    },
    eventAreaPermissions: {
      get(): PermissionHintsDto | null {
        return eventDetailStore.getState().eventAreaPermissions
      },
      set(value: PermissionHintsDto) {
        eventDetailStore.setEventAreaPermissions(value)
      }
    },
    campaigns: {
      get(): CampaignDto[] {
        return eventDetailStore.getState().campaigns
      },
      set(value: CampaignDto[]) {
        eventDetailStore.setCampaigns(value)
      }
    },
    isTeamCaptain(): boolean {
      return this.eventPermissions?.permissions?.includes(ObjectPermissions.TeamCaptain) ?? false
    },
    isCoordinator(): boolean {
      return this.eventPermissions?.permissions?.includes(ObjectPermissions.Coordinator) ?? false
    },
    isTeamCaptainOrCoordinator(): boolean {
      return this.isTeamCaptain || this.isCoordinator
    }
  },
  methods: {
    deletePostersByIds(posterIds: number[]) {
      this.posters = this.posters.filter(({id}) => !posterIds.includes(id))
    },
    mergePosters(posters: PosterDto[]) {
      for (const poster of posters) {
        const originalIndex = this.posters.findIndex(({id}) => id === poster.id)
        if (originalIndex > -1) {
          Object.assign(this.posters[originalIndex], poster)
        } else {
          this.posters.push(poster)
        }
      }
    },
    async refreshParticipants() {
      this.participations = (await apiClient.eventParticipations.list({
        event: this.event.id
      })).payload.data
    }
  }
})
