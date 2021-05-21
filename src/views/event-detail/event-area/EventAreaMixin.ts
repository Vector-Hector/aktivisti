import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { Feature } from 'geojson'
import { bbox } from '@turf/turf'
import { EventDto } from '@/api/model/EventDto'
import { PermissionsDto } from '@/api/model/APIEnvelope'

export default defineComponent({
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true

    },
    eventArea: {
      type: Object as PropType<EventAreaDto>,
      required: true
    },
    areaPermissions: {
      type: Object as PropType<PermissionsDto>,
      required: true
    }
  },
  computed: {
    feature(): Feature | undefined {
      if (!this.eventArea) return
      return {
        type: 'Feature',
        geometry: this.eventArea.geometry,
        properties: {
          color: this.eventArea.color
        }
      }
    },
    bbox() {
      if (!this.feature) return
      return bbox(this.feature)
    }
  }
})
