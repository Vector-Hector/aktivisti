import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { EventDto } from '@/api/model/EventDto'

export default defineComponent({
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true

    },
    eventAreas: {
      type: Array as PropType<EventAreaDto[]>,
      required: true
    },
    areaId: {
      type: String as PropType<string>,
      required: true
    }
  },
  computed: {
    eventArea(): EventAreaDto {
      return this.eventAreas.find(({id}) => id === parseInt(this.areaId))!
    }
  }
})
