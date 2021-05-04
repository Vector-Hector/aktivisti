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
  emits: ['update:eventAreas'],
  computed: {
    eventArea: {
      get(): EventAreaDto {
        return this.eventAreas.find(({id}) => id === parseInt(this.areaId))!
      },
      set(value: EventAreaDto) {
        this.$emit('update:eventAreas', [
          ...this.eventAreas.filter(({id}) => id !== value.id),
          value
        ])
      }
    }
  }
})
