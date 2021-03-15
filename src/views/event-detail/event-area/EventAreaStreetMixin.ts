import { defineComponent, PropType } from 'vue'
import { AddressDetails } from '@/api/model/AreaDetailsDto'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, bboxPolygon, transformScale } from '@turf/turf'
import { FeatureCollection } from 'geojson'

export default defineComponent({
  mixins: [EventAreaMixin],
  props: {
    street: {
      type: String as PropType<string>,
      required: true
    }
  },
  computed: {
    addresses(): AddressDetails[] | undefined {
      return this.eventArea.area_details?.streets.find(({name}) => name === this.street)?.addresses
    },
    bbox(): BBox2d | undefined {
      if (!this.addresses) return
      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: this.addresses.map((address) => {
          return {
            type: 'Feature',
            geometry: address.geometry,
            properties: {}
          }
        })
      }
      return bbox(transformScale(bboxPolygon(bbox(featureCollection)), 1.4)) as BBox2d
    }
  }
})
