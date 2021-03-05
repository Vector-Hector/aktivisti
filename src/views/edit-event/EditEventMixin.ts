import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { CampaignDto } from '@/api/model/CampaignDto'

/**
 * A mixin for working with an event to avoid repetition
 * It serves two purposes:
 *
 * 1. Expose mandatory props which are the event
 * it's working on and campaigns that are shared during the edit/creation process to avoid
 * repeated API calls
 *
 * 2. Introduce a computed property that will propagate changes to the event
 */
export default defineComponent({
  props: {
    event: {
      type: Object as PropType<Partial<EventDto>>,
      required: true
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
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
