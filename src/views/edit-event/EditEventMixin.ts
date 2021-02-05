import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'

export default defineComponent({
  props: {
    event: {
      type: Object as PropType<Partial<EventDto>>,
      required: true
    }
  },
  emits: ['update:event'],
  computed: {
    localEvent: {
      get(): Partial<EventDto> {
        return this.event
      },
      set(value: Partial<EventDto>) {
        this.$emit('update:event', value)
      }
    }
  }
})
