import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { Feature } from 'geojson'
import { bbox } from '@turf/turf'
import { EventDto } from 'src/api/model/EventDto'
import { PermissionsDto } from 'src/api/model/APIEnvelope'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

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
    bbox(): BBox2d | undefined {
      if (!this.feature) return
      return bbox(this.feature) as BBox2d
    }
  }
})
