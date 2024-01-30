<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setMetrics(metrics: EventMetricDto[]): void
  setCampaigns(campaings: CampaignDto[]): void
  setEventCampaign(campaignId: number): void
}

export default {
  async beforeRouteEnter(to, from, next) {
    if (!userStore.hasAtLeastOneManagePermission()) {
      ErrorBus.emit(
        NOT_AUTHORIZED,
        'Um eine Aktion zu erstellen benötigst du eine Koordinator*innenberechtigung'
      )
      next({ name: 'login' })
    } else {
      const [campaignRequest, metricsRequest] = await Promise.all([
        apiClient.campaigns.list(),
        apiClient.eventMetrics.list()
      ])
      next((vm) => {
        const instance = vm as IInstance
        instance.setMetrics(metricsRequest.payload.data)
        const campaigns = campaignRequest.payload.data
        instance.setCampaigns(campaigns)

        if (campaigns.length === 1) {
          instance.setEventCampaign(campaigns[0].id)
        }
      })
    }
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, ref } from 'vue'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { QBtn, QInput, QPage, QScrollArea, QSelect, useQuasar } from 'quasar'
import { EventDto } from 'src/api/model/EventDto'
import FormError from 'components/FormError.vue'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { userStore } from 'src/store/UserStore'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { useRouter } from 'vue-router'

const $router = useRouter()
const $q = useQuasar()

const metrics = ref<EventMetricDto[]>([])
const campaigns = ref<CampaignDto[]>([])
const event = ref<Partial<EventDto>>({
  event_type: EventTypes.DOOR_TO_DOOR,
  name: '',
  campaigns: [] as number[]
})
const errors = ref<any>({})

async function saveAndProceed() {
  errors.value = {}
  const initialStartDate = new Date()
  initialStartDate.setHours(
    initialStartDate.getHours() + Math.round(initialStartDate.getMinutes() / 60)
  )
  initialStartDate.setMinutes(0, 0, 0)

  const initialEndDate = new Date(initialStartDate)
  initialEndDate.setHours(initialStartDate.getHours() + 1)

  try {
    event.value = (
      await apiClient.events.create({
        ...event.value,
        metrics: metrics.value
          .filter((metric) =>
            metric.mandatory_for_types.includes(event.value.event_type!)
          )
          .map(({ id }) => id),
        start_date: initialStartDate.toISOString(),
        end_date: initialEndDate.toISOString()
      })
    ).payload.data

    await $router.push({
      name: 'edit-event-details',
      params: {
        eventId: event.value.id!
      }
    })
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
    } else {
      $q.notify({
        color: 'negative',
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      })
    }
  }
}

function setMetrics(newMetrics: EventMetricDto[]) {
  metrics.value = newMetrics
}

function setCampaigns(newCampaigns: CampaignDto[]) {
  campaigns.value = newCampaigns
}

function setEventCampaign(campaignId: number) {
  event.value.campaigns?.push(campaignId)
}

defineExpose({
  setMetrics,
  setCampaigns,
  setEventCampaign
})
</script>

<template>
  <QScrollArea class="flex-fill d-flex">
    <QPage>
      <div class="container">
        <div class="create-event">
          <h3>Neue Aktion erstellen</h3>
          <FormError :error="errors.non_field_error" />
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
            <QBtn color="primary" label="Erstellen" @click="saveAndProceed()" />
          </div>
        </div>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
.create-event {
  margin: 0 auto;
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
