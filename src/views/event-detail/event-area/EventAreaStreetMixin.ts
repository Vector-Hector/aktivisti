import { defineComponent, PropType } from 'vue'
import { AddressDetails } from '@/api/model/AreaDetailsDto'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'

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
    }
  }
})
