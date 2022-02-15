import { computed, defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { editEventStore } from 'src/store/EditEventStore'
import { posterListStore } from 'src/store/PosterListStore'
import { PosterDto } from 'src/api/model/PosterDto'

/**
 * @deprecated please use `useEditEventMixin()` in combination with compostion api.
 */
export default defineComponent({
  computed: {
    event: {
      get(): EventDto {
        return editEventStore.getState().event!
      },
      set(value: EventDto) {
        editEventStore.setEvent(value)
      }
    },
    eventAreas: {
      get(): EventAreaDto[] {
        return editEventStore.getState().eventAreas
      },
      set(areas: EventAreaDto[]) {
        editEventStore.setEventAreas(areas)
      }
    },
    metricRecords: {
      get(): EventMetricRecordDto[] {
        return editEventStore.getState().metricRecords
      },
      set(records: EventMetricRecordDto[]) {
        editEventStore.setMetricRecords(records)
      }
    },
    campaigns() {
      return editEventStore.getState().campaigns
    },
    updatingAreaFeatureIds: {
      get(): Set<string> {
        return editEventStore.getState().updatingAreaFeatureIds
      },
      set(featureIds: string[] | Set<string>) {
        editEventStore.setUpdatingAreaFeatureIds(featureIds)
      }
    },
    deletingAreaIds: {
      get(): Set<string> {
        return editEventStore.getState().deletingAreaIds
      },
      set(ids: string[] | Set<string>) {
        editEventStore.setDeletingAreaIds(ids)
      }
    },
    posters: {
      get(): Partial<PosterDto>[] {
        return posterListStore.state.posters
      },
      set(posters: PosterDto[]) {
        posterListStore.state.posters = posters
      }
    }
  }
})

export function useEditEventMixin() {
  const event = computed({
    get(): EventDto {
      return editEventStore.getState().event!
    },
    set(value: EventDto) {
      editEventStore.setEvent(value)
    }
  })
  const eventAreas = computed({
    get(): EventAreaDto[] {
      return editEventStore.getState().eventAreas
    },
    set(areas: EventAreaDto[]) {
      editEventStore.setEventAreas(areas)
    }
  })

  const metricRecords = computed({
    get(): EventMetricRecordDto[] {
      return editEventStore.getState().metricRecords
    },
    set(records: EventMetricRecordDto[]) {
      editEventStore.setMetricRecords(records)
    }
  })

  const campaigns = computed(() => editEventStore.getState().campaigns)

  const updatingAreaFeatureIds = computed({
    get(): Set<string> {
      return editEventStore.getState().updatingAreaFeatureIds
    },
    set(featureIds: Set<string>) {
      editEventStore.setUpdatingAreaFeatureIds(featureIds)
    }
  })

  const deletingAreaIds = computed({
    get(): Set<string> {
      return editEventStore.getState().deletingAreaIds
    },
    set(ids: Set<string>) {
      editEventStore.setDeletingAreaIds(ids)
    }
  })

  const posters = computed({
    get(): Partial<PosterDto>[] {
      return posterListStore.state.posters
    },
    set(posters: Partial<PosterDto>[]) {
      posterListStore.state.posters = posters
    }
  })

  return {event, eventAreas, metricRecords, campaigns, updatingAreaFeatureIds, deletingAreaIds, posters}
}
