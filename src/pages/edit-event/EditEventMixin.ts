import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { editEventStore } from 'src/store/EditEventStore'

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
    }
  }
})
