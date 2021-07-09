<template>
  <QPage class="flex-fill">
    <div class="container">
      <div class="create-event">
        <h3>Neue Aktion erstellen</h3>
        <FormError
          :error="errors.non_field_error"
        />
        <QInput
          filled
          class="create-event-input"
          v-model="event.name"
          label="Name der Aktion"
          :error-message="errors.name?.[0]"
          :error="!!errors.name?.length"
          :rules="[$validationRules.isRequired]"
        />
        <QSelect
          filled
          class="create-event-input"
          v-model="event.event_type"
          label="Aktionstyp"
          :disabled="true"
          :options="eventTypeOptions"
          option-label="label"
          option-value="key"
          emit-value
          map-options
          :error-message="errors.event_type?.[0]"
          :error="!!errors.event_type?.length"
        />

        <QSelect
          filled
          class="create-event-input"
          v-model="event.campaigns"
          label="Kampagnen"
          placeholder="Wähle eine Kampagne aus"
          :multiple="true"
          :options="campaigns"
          option-label="name"
          option-value="id"
          map-options
          emit-value
          :error-message="errors.campaigns?.[0]"
          :error="!!errors.campaigns?.length"
        />
        <div class="buttons">
          <QBtn
            outline
            color="primary"
            label="Abbrechen"
            @click="$router.go(-1)"
          />
          <QBtn
            color="primary"
            label="Erstellen"
            @click="saveAndProceed()"
          />
        </div>
      </div>
    </div>
  </QPage>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { QBtn, QInput, QPage, QSelect } from 'quasar'
import { EventDto } from 'src/api/model/EventDto'
import FormError from 'components/FormError.vue'
import { EventMetricDto } from 'src/api/model/EventMetricDto'

export default defineComponent({
  name: 'CreateEvent',
  components: {
    FormError,
    QSelect,
    QInput,
    QPage,
    QBtn
  },
  async beforeRouteEnter(to, from, next) {
    const [campaignRequest, metricsRequest] = await Promise.all([
      apiClient.campaigns.list(),
      apiClient.eventMetrics.list()
    ])

    next((vm) => {
      // @ts-ignore
      vm.metrics = metricsRequest.payload.data
      // @ts-ignore
      vm.campaigns = campaignRequest.payload.data
    })
  },
  data() {
    return {
      metrics: [] as EventMetricDto[],
      campaigns: [],
      event: {
        event_type: EventTypes.DOOR_TO_DOOR,
        name: '',
        campaigns: [] as number[]
      } as Partial<EventDto>,
      errors: {},
      eventTypeOptions
    }
  },
  methods: {
    async saveAndProceed() {
      this.errors = {}
      const initialStartDate = new Date()
      initialStartDate.setHours(initialStartDate.getHours() + Math.round(initialStartDate.getMinutes() / 60))
      initialStartDate.setMinutes(0, 0, 0)

      const initialEndDate = new Date(initialStartDate)
      initialEndDate.setHours(initialStartDate.getHours() + 1)

      try {
        this.event = (await this.$apiClient.events.create({
          ...this.event,
          metrics: this.metrics
            .filter((metric) => metric.mandatory_for_types.includes(this.event.event_type!))
            .map(({id}) => id),
          start_date: initialStartDate.toISOString(),
          end_date: initialEndDate.toISOString()
        })).payload.data

        await this.$router.push({
          name: 'edit-event-details',
          params: {
            id: this.event.id!
          }
        })
      } catch (e) {
        if (e.response?.status === 400) {
          this.errors = e.response.data
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Ein unerwarteter Fehler ist aufgetreten'
          })
        }
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.create-event {
  margin: 10vh auto;
  max-width: 500px;
  width: 100%;

  h3 {
    font-size: 1.5rem;
  }

  .create-event-input {
    margin: 0.5rem 0;
  }
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  * {
    margin-left: 1rem;
  }
}
</style>
