import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { cloneDeep, isEqual } from 'lodash-es'
import { SettleDebouncer } from 'src/utils/debounce'
import EditEventMixin from 'pages/edit-event/EditEventMixin'


export default defineComponent({
  name: 'EditEventAutoSaveMixin',
  mixins: [EditEventMixin],
  created() {
    this.lastSavedEvent = this.normalizedEventCopy(this.event)
  },
  data() {
    return {
      saveDebouncer: new SettleDebouncer(),
      lastSavedEvent: null as EventDto | null,
      errors: {}
    }
  },
  computed: {
    currentEvent(): EventDto {
      // a deep copy of the event so we can track nested changes
      return this.normalizedEventCopy(this.event)
    }
  },
  watch: {
    currentEvent: {
      handler(newValue) {
        void this.saveDebouncer.executeDebounced(async () => {
          if (!isEqual(this.lastSavedEvent, newValue)) {
            await this.saveEvent()
          } else {
            this.errors = {}
          }
        })
      },
      deep: true
    }
  },
  methods: {
    normalizedEventCopy(event: EventDto) {
      return cloneDeep({
        ...event,
        // normalize the date format
        start_date: new Date(this.event.start_date).toISOString(),
        end_date: new Date(this.event.end_date).toISOString()
      })
    },
    async saveEvent(): Promise<void> {
      this.errors = {}
      try {
        const event = (await this.$apiClient.events.update(this.event.id.toString(), {
          ...this.event
        })).payload.data
        this.event = event
        this.lastSavedEvent = this.normalizedEventCopy(event)
        this.$q.notify({
          color: 'positive',
          message: 'Gespeichert'
        })
      } catch (e) {
        if (e.response?.status === 400) {
          this.errors = e.response.data
          this.$q.notify({
            color: 'negative',
            message: 'Bitte korrigiere die Fehler im Formular'
          })
        } else {
          this.errors = {
            'non-field-error': 'Ein unbekannter Fehler ist aufgetreten'
          }
          this.$q.notify({
            color: 'negative',
            message: 'Beim speichern des events ist etwas schiefgegangen'
          })
        }
      }
    }
  }
})
