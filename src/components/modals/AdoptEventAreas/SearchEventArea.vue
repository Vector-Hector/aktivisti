<script setup lang="ts">
import {
  QBtn,
  QCardSection,
  QForm,
  QInput,
  QScrollArea,
  QSpinnerDots
} from 'quasar'
import { ionSearch } from '@quasar/extras/ionicons-v5'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { onMounted, ref } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import EventAreaList from 'components/EventAreaList.vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'

interface Emits {
  (e: 'onEventAreaClick', eventArea: EventAreaDto): void
}

const emit = defineEmits<Emits>()

const isInitial = ref<boolean>(true)
const isLoading = ref<boolean>(false)

const eventAreas = ref<EventAreaDto[]>([])
const events = ref<EventDto[]>([])
const campaigns = ref<CampaignDto[]>([])
const searchString = ref<string | null>(null)

const fetchEventAreas = async (searchString: string) => {
  const response = await apiClient.eventAreas.list({ name: searchString }, [
    'event'
  ])
  events.value = response.payload.embedded.event
  eventAreas.value = response.payload.data
}

const fetchCampaigns = async () => {
  const response = await apiClient.campaigns.list()
  campaigns.value = response.payload.data
}

const handleSubmit = async () => {
  isInitial.value = false
  if (searchString.value) {
    isLoading.value = true
    await fetchEventAreas(searchString.value)
    isLoading.value = false
  }
}

function handleEventAreaClick(eventArea: EventAreaDto) {
  emit('onEventAreaClick', eventArea)
}

onMounted(async () => {
  await fetchCampaigns()
})
</script>

<template>
  <QCardSection class="description-section">
    <span class="description">
      Such nach einem Gebiet, welches du übernehmen möchtest.
    </span>
  </QCardSection>
  <QCardSection class="section">
    <QForm @submit="handleSubmit">
      <div class="row">
        <div class="col-grow">
          <QInput
            dense
            label="Gebietsname"
            v-model="searchString"
            :rules="[(val) => val?.length >= 3 || 'Mindestens 3 Zeichen']"
          />
        </div>
        <div class="col-auto">
          <QBtn
            :icon="ionSearch"
            color="primary"
            type="submit"
            :disable="isLoading"
            flat
            round
            small
          />
        </div>
      </div>
    </QForm>
    <template v-if="!isInitial">
      <div v-if="isLoading" class="row justify-center q-my-md">
        <QSpinnerDots color="primary" size="40px" />
      </div>
      <template v-else>
        <QScrollArea v-if="eventAreas.length > 0" class="event-area-list">
          <EventAreaList
            :event-areas="eventAreas"
            :events="events"
            :campaigns="campaigns"
            @onEventAreaClick="handleEventAreaClick"
          />
        </QScrollArea>
        <div class="empty-list-placeholder" v-else>
          Sie haben keine Gebiete mit diesem Namen angelegt.
        </div>
      </template>
    </template>
  </QCardSection>
</template>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.description {
  color: $grey-6;
  font-size: 0.75rem;
  line-height: 1;
  display: block;
}

.description-section {
  padding-bottom: 0;
}

.event-area-list {
  margin: 1rem 0;
  overflow: hidden;
  height: 400px;
  width: 300px;
}

.empty-list-placeholder {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
