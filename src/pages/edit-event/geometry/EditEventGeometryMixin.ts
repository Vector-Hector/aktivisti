import EditEventMixin from 'pages/edit-event/EditEventMixin'
import { defineComponent } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { apiClient } from 'src/api/ApiClient'
import { Feature } from 'geojson'


export default defineComponent({
  name: 'EditEventGeometryMixin',
  mixins: [EditEventMixin],
  computed: {
    features(): Feature[] {
      return this.eventAreas.map((area) => {
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
    }
  },
  methods: {
    async updateArea(area: Partial<EventAreaDto>) {
      this.updatingAreaFeatureIds = new Set([...this.updatingAreaFeatureIds, area.feature_id!])
      let updatedArea: EventAreaDto
      try {
      if (area.id) {
        updatedArea = (await apiClient.eventAreas.update(area.id.toString(), area as EventAreaDto)).payload.data
      } else {
        updatedArea = (await apiClient.eventAreas.create(area)).payload.data
      }
      this.eventAreas = this.eventAreas.map((item) => {
        if (item.feature_id === updatedArea.feature_id) {
          return updatedArea
        } else {
          return item
        }
      })
      this.updatingAreaFeatureIds.delete(updatedArea.feature_id)
      this.clearAreaError(updatedArea.feature_id)
    } catch (e) {
      if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
        const errorMessage = e.response?.data?.[0] ?? 'Etwas ging beim anlegen oder verändern eines Gebiets schief'
        this.$q.notify({
          color: 'negative',
          message: e.response?.data?.[0] ?? 'Etwas ging beim anlegen oder verändern eines Gebiets schief'
        })
        if (area.feature_id) {
          this.updatingAreaFeatureIds.delete(area.feature_id)
          this.addAreaError(area.feature_id?.toString(), errorMessage)
        }
      } else {
        throw e
      }
    }
    },
    async deleteAreaByFeatureId(deleteId: string) {
      const area = this.eventAreas.find(({feature_id}) => feature_id === deleteId)
      if (area?.id) {
        try {
          this.deletingAreaIds.add(deleteId)
          await apiClient.eventAreas.delete(area.id.toString())
          this.eventAreas = this.eventAreas.filter(({id}) => area?.id !== id)
        } catch (e) {
          this.$q.notify({
            message: 'Etwas ging schief beim löschen des Gebiets',
            color: 'negative',
            timeout: 3000
          })
        } finally {
          this.deletingAreaIds.delete(deleteId)
        }
      }
      this.eventAreas = this.eventAreas.filter(({feature_id}) => deleteId !== feature_id)
    }
  }
})
