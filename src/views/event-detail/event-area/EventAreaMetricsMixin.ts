import { defineComponent, PropType } from 'vue'
import { Feature, Point } from 'geojson'
import { bbox, center, circle } from '@turf/turf'
import { AddressDetails } from '@/api/model/AreaDetailsDto'
import EventAreaStreetMixin from '@/views/event-detail/event-area/EventAreaStreetMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

export default defineComponent({
  mixins: [EventAreaStreetMixin],
  props: {
    houseNumber: {
      type: String as PropType<string>,
      required: true
    }
  },
  computed: {
    address(): AddressDetails | undefined {
      return this.addresses?.find(({house_number}) => house_number === this.houseNumber)
    },
    location(): Feature<Point> | undefined {
      if (!this.address?.geometry) return
      //@ts-ignore
      return center(this.address!.geometry)
    },
    bbox(): BBox2d | undefined {
      if (!this.location) return
      return bbox(circle(this.location!, 0.1)) as BBox2d
    }
  }
})
