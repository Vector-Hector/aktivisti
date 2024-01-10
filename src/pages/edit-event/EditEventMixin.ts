import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { editEventStore } from 'src/store/EditEventStore'
import { posterListStore } from 'src/store/PosterListStore'
import { PosterDto } from 'src/api/model/PosterDto'

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

  const eventAreasWithError = computed(() => {
    return editEventStore.getState().areasWithError
  })

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

  const addAreaError = (id: string, error: string) => {
    editEventStore.setEventAreaError(id, error)
  }
  const clearAreaError = (id: string) => {
    editEventStore.clearEventAreaError(id)
  }

  return {
    event,
    eventAreas,
    eventAreasWithError,
    metricRecords,
    campaigns,
    updatingAreaFeatureIds,
    deletingAreaIds,
    posters,
    addAreaError,
    clearAreaError
  }
}
