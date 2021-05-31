import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  mixins: [EventDetailMixin],
  props: {
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
