import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import { computed } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'
import { useQuasar } from 'quasar'

export function useEditEventGeometryMixin() {
  const $q = useQuasar()
  const {
    eventAreas,
    updatingAreaFeatureIds,
    clearAreaError,
    addAreaError,
    deletingAreaIds
  } = useEditEventMixin()

  const features = computed(() => {
    return eventAreas.value.map((area) => {
      return {
        type: 'Feature',
        geometry: area.geometry,
        id: area.feature_id,
        properties: {
          // find the corresponding area and copy the color
          color: area.color
        }
      }
    })
  })

  const updateArea = async (area: Partial<EventAreaDto>) => {
    updatingAreaFeatureIds.value = new Set([
      ...updatingAreaFeatureIds.value,
      area.feature_id!
    ])
    let updatedArea: EventAreaDto
    try {
      if (area.id) {
        updatedArea = (
          await apiClient.eventAreas.update(
            area.id.toString(),
            area as EventAreaDto
          )
        ).payload.data
      } else {
        updatedArea = (await apiClient.eventAreas.create(area)).payload.data
      }
      eventAreas.value = eventAreas.value.map((item) => {
        if (item.feature_id === updatedArea.feature_id) {
          return updatedArea
        } else {
          return item
        }
      })
      updatingAreaFeatureIds.value.delete(updatedArea.feature_id)
      clearAreaError(updatedArea.feature_id)
    } catch (e) {
      if (apiClient.isApiClientError(e) && e.response?.status === 400) {
        const errorMessage =
          e.response?.data?.[0] ??
          'Etwas ging beim anlegen oder verändern eines Gebiets schief'
        $q.notify({
          color: 'negative',
          message:
            e.response?.data?.[0] ??
            'Etwas ging beim anlegen oder verändern eines Gebiets schief'
        })
        if (area.feature_id) {
          updatingAreaFeatureIds.value.delete(area.feature_id)
          addAreaError(area.feature_id?.toString(), errorMessage)
        }
      } else {
        throw e
      }
    }
  }

  const deleteAreaByFeatureId = async (deleteId: string) => {
    const area = eventAreas.value.find(
      ({ feature_id }) => feature_id === deleteId
    )
    if (area?.id) {
      try {
        deletingAreaIds.value.add(deleteId)
        await apiClient.eventAreas.delete(area.id.toString())
        eventAreas.value = eventAreas.value.filter(({ id }) => area?.id !== id)
      } catch {
        $q.notify({
          message: 'Etwas ging schief beim löschen des Gebiets',
          color: 'negative',
          timeout: 3000
        })
      } finally {
        deletingAreaIds.value.delete(deleteId)
      }
    }
    eventAreas.value = eventAreas.value.filter(
      ({ feature_id }) => deleteId !== feature_id
    )
  }

  return { features, updateArea, deleteAreaByFeatureId }
}
