<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { EventTypes, useEventTypes } from 'src/api/model/EventTypes'
import { UserDto } from 'src/api/model/UserDto'
import {
  QBtn,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QPage,
  QScrollArea,
  QSeparator
} from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionCheckmark, ionClose } from '@quasar/extras/ionicons-v5'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { myParticipationsStore } from 'src/store/MyParticipationsStore'
import { userStore } from 'src/store/UserStore'
import { EventStatus } from 'src/api/model/EventStatus'
import { apiClient } from 'src/api/ApiClient'
import { useDateFormat } from 'src/utils/dateFormat'

const participatedEvents = ref<EventDto[]>([])
const invitingUsers = ref<UserDto[]>([])
const campaigns = ref<CampaignDto[]>([])
const loading = ref(true)

const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()

onMounted(async () => {
  await Promise.all([getParticipatedEvents(), getCampaigns()])
  loading.value = false
})

const eventParticipations = computed({
  get(): EventParticipationDto[] {
    return myParticipationsStore.getState().eventParticipations
  },
  set(value: EventParticipationDto[]) {
    myParticipationsStore.setEventParticipations(value)
  }
})
const acceptedEvents = computed(() => {
  return eventParticipations.value
    .filter((item) => !item.is_pending_invitation)
    .map((participation) => {
      return {
        participation,
        event: eventForParticipation(participation)
      }
    })
    .sort((a, b) => {
      if (a.event && b.event) {
        return a.event?.start_date > b.event.start_date ? -1 : 1
      } else {
        return 0
      }
    })
})
const pendingEvents = computed(() => {
  return eventParticipations.value
    .filter((item) => item.is_pending_invitation)
    .map((participation) => {
      return {
        participation,
        event: eventForParticipation(participation)
      }
    })
    .sort((a, b) => {
      if (a.event && b.event) {
        return a.event?.start_date > b.event.start_date ? -1 : 1
      } else {
        return 0
      }
    })
})

async function getCampaigns() {
  const response = await apiClient.campaigns.list()
  campaigns.value = response.payload.data
}
async function getParticipatedEvents() {
  const responseData = (
    await apiClient.eventParticipations.list(
      {
        user: userStore.getState().user?.id,
        status: EventStatus.ACTIVE
      },
      ['event', 'inviting_users']
    )
  ).payload
  participatedEvents.value = responseData.embedded.event
  invitingUsers.value = responseData.embedded.inviting_users
  myParticipationsStore.setEventParticipations(responseData.data)
}
function accept(eventParticipation: EventParticipationDto) {
  eventParticipation.is_pending_invitation = false
  void apiClient.eventParticipations.accept(eventParticipation.id.toString())
}
function reject(eventParticipation: EventParticipationDto) {
  eventParticipations.value = eventParticipations.value.filter(
    ({ id }) => id !== eventParticipation.id
  )
  void apiClient.eventParticipations.reject(eventParticipation.id.toString())
}
function eventForParticipation(participation: EventParticipationDto) {
  return participatedEvents.value.find(({ id }) => participation.event === id)
}
function eventTypeLabel(event_type: EventTypes) {
  return eventTypeOptions.find(({ key }) => key === event_type)?.label
}
function campaignsByIds(findIds: number[]): CampaignDto[] {
  return campaigns.value.filter(({ id }) => findIds.includes(id))
}
function findInvitingUsers(findIds: number[]): UserDto[] {
  return invitingUsers.value.filter(({ id }) => findIds.includes(id))
}
</script>

<template>
  <QPage class="flex column col-grow">
    <QScrollArea class="flex col-grow">
      <div class="container col-grow">
        <PageLoadingSpinner v-if="loading" />
        <div v-else class="my-participations-content">
          <div v-show="pendingEvents.length > 0">
            <h3 class="my-participations-section-heading">
              {{ $t('myParticipations.pendingInvitations') }}
            </h3>
            <QSeparator class="profile-section-divider" />

            <QList>
              <QItem
                v-for="{ participation, event } in pendingEvents"
                :key="participation.id"
                :clickable="true"
                :to="{
                  name: 'event-detail',
                  params: { eventId: participation.event }
                }"
              >
                <QItemSection>
                  <QItemLabel>
                    <b>{{ event.name }}</b>
                  </QItemLabel>
                  <QItemLabel>
                    {{ eventTypeLabel(event.event_type) }}
                  </QItemLabel>
                  <QItemLabel>
                    {{
                      campaignsByIds(event.campaigns)
                        .map(({ name }) => name)
                        .join(',')
                    }}
                  </QItemLabel>
                  <QItemLabel>
                    {{ dateFormat(event.start_date, 'datetime') }}
                  </QItemLabel>
                  <QItemLabel>
                    <i>
                      {{
                        $t(
                          'myParticipations.hasInvitedYou',
                          participation.inviting_users.length,
                          {
                            named: {
                              invitingUsers:
                                findInvitingUsers(participation.inviting_users)
                                  .map(({ username }) => username)
                                  .join(',') ?? $t('myParticipations.unknown')
                            }
                          }
                        )
                      }}
                    </i>
                  </QItemLabel>
                </QItemSection>
                <QItemSection side>
                  <div class="action-buttons">
                    <QBtn
                      dense
                      flat
                      @click.prevent.stop="reject(participation)"
                      :icon="ionClose"
                    >
                      {{ $t('myParticipations.reject') }}
                    </QBtn>
                    <QBtn
                      dense
                      flat
                      color="primary"
                      @click.prevent.stop="accept(participation)"
                      :icon="ionCheckmark"
                    >
                      {{ $t('myParticipations.accept') }}
                    </QBtn>
                  </div>
                </QItemSection>
              </QItem>
            </QList>
          </div>

          <div v-show="acceptedEvents.length > 0">
            <h3 class="my-participations-section-heading">
              {{ $t('myParticipations.activeParticipations') }}
            </h3>
            <QSeparator class="profile-section-divider" />

            <QList>
              <QItem
                v-for="{ participation, event } in acceptedEvents"
                :key="participation.id"
                :clickable="true"
                :to="{
                  name: 'event-detail',
                  params: { eventId: participation.event }
                }"
              >
                <QItemSection>
                  <QItemLabel>
                    <b>{{ event.name }}</b>
                  </QItemLabel>
                  <QItemLabel>
                    {{ eventTypeLabel(event.event_type) }}
                  </QItemLabel>
                  <QItemLabel>
                    {{
                      campaignsByIds(event.campaigns)
                        .map(({ name }) => name)
                        .join(',')
                    }}
                  </QItemLabel>
                  <QItemLabel>
                    {{ dateFormat(event.start_date, 'datetime') }}
                  </QItemLabel>
                </QItemSection>
              </QItem>
            </QList>
          </div>
          <div v-if="eventParticipations.length <= 0" class="placeholder">
            <p>{{ $t('myParticipations.noEventParticipations.info') }}</p>
            <QBtn
              :label="
                $t('myParticipations.noEventParticipations.searchEventsButton')
              "
              :to="{ name: 'events' }"
              color="primary"
            />
          </div>
        </div>
      </div>
    </QScrollArea>
  </QPage>
</template>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

.my-participations-section-heading {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  line-height: 1.7rem;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0 0 0;
}

.filter-container {
  padding: 0 1em 1em 1em;
}

.action-buttons {
  display: flex;
  flex-direction: column;
}
</style>
