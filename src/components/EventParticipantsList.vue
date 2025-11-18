<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { ionChevronDown, ionSearch } from '@quasar/extras/ionicons-v5'
import { QList, useQuasar, QExpansionItem, QInput, QIcon } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'
import EventParticipantsListItem from './EventParticipantsListItem.vue'

interface Props {
  eventId: number
  eventSubAssociation?: number
}

const props = defineProps<Props>()
const participations = ref<EventParticipationDto[]>([])
const filteredParticipations = ref<EventParticipationDto[]>([])

const $q = useQuasar()
const { t } = useI18n()

onMounted(async () => {
  participations.value = (
    await apiClient.eventParticipations.list({
      event: props.eventId,
      is_pending_invitation: false
    })
  ).payload.data
})

watch(
  () => participations.value,
  (participations) => {
    filteredParticipations.value = participations
  }
)

const verifiedParticipations = computed(() => {
  return filteredParticipations.value.filter(
    ({ is_verified, is_team_captain, is_event_coordinator }) =>
      !is_team_captain && !is_event_coordinator && is_verified
  )
})
const notVerifiedParticipations = computed(() => {
  return filteredParticipations.value.filter(
    ({ is_verified, is_team_captain, is_event_coordinator }) =>
      !is_team_captain && !is_event_coordinator && !is_verified
  )
})
const areTeamCaptainsParticipations = computed(() => {
  return filteredParticipations.value.filter(
    ({ is_team_captain, is_event_coordinator }) =>
      !is_event_coordinator && is_team_captain
  )
})

const areCoordinatorParticipations = computed(() => {
  return filteredParticipations.value.filter(
    ({ is_event_coordinator }) => is_event_coordinator
  )
})

const query = ref<string>('')
const isCoordinatorsExpanded = ref<boolean>(false)
const isTeamCaptainsExpanded = ref<boolean>(false)
const isVerifiedExpanded = ref<boolean>(false)
const isNotVerifiedExpanded = ref<boolean>(false)
const highlight = ref<boolean>(false)

function updateQuery(newValue: string): void {
  query.value = newValue
  const q = query.value.trim().toLowerCase()
  if (q.length >= 3) {
    highlight.value = true
    filteredParticipations.value = participations.value.filter((value) =>
      value.user_username.toLowerCase().includes(q)
    )
    isVerifiedExpanded.value = verifiedParticipations.value.length > 0
    isNotVerifiedExpanded.value = notVerifiedParticipations.value.length > 0
    isTeamCaptainsExpanded.value =
      areTeamCaptainsParticipations.value.length > 0
    isCoordinatorsExpanded.value = areCoordinatorParticipations.value.length > 0
  } else {
    highlight.value = false
    filteredParticipations.value = participations.value
    isCoordinatorsExpanded.value = false
    isNotVerifiedExpanded.value = false
    isTeamCaptainsExpanded.value = false
    isVerifiedExpanded.value = false
  }
}

async function deleteParticipation(deleteId: number) {
  participations.value = participations.value.filter(
    ({ id }) => deleteId !== id
  )
  await apiClient.eventParticipations.delete(deleteId.toString())
}

async function verifyParticipation(participationId: number) {
  const participationIndex = participations.value.findIndex(
    ({ id }) => participationId === id
  )
  const participationRequest = await apiClient.eventParticipations.patch(
    participationId.toString(),
    {
      is_verified: true
    }
  )
  participations.value[participationIndex] = participationRequest.payload.data
}
async function elevateToTeamCaptain(userId: number) {
  try {
    await apiClient.user.elevateToTeamCaptain(
      userId.toString(),
      props.eventSubAssociation
    )
    const participation = participations.value.find(
      ({ user }) => user === userId
    )
    participation!['is_team_captain'] = true
  } catch (e) {
    if (
      apiClient.isApiClientError(e) &&
      e.response?.status === 400 &&
      e.response?.data?.sub_association
    ) {
      $q.notify({
        color: 'negative',
        message: t('eventParticipantsModal.notifications.noSubAssociationError')
      })
    } else {
      $q.notify({
        color: 'negative',
        message: t('eventParticipantsModal.notifications.generalError')
      })
    }
  }
}
function handleInviteToTeamCaptain(userId: number, username: string) {
  $q.dialog({
    title: t('eventParticipantsModal.promoteUserToTeamcamptain.dialog.title'),
    message: t(
      'eventParticipantsModal.promoteUserToTeamcamptain.dialog.description',
      [`<b>${username}</b>`]
    ),
    html: true,
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(() => elevateToTeamCaptain(userId))
}
</script>

<template>
  <div class="row">
    <div class="col">
      <div class="row" v-if="participations.length > 0">
        <div class="col-grow">
          <QInput
            use-input
            :model-value="query"
            @update:model-value="updateQuery"
            :label="$t('eventParticipantsModal.input.label')"
            :placeholder="$t('eventParticipantsModal.input.placeholder')"
            dense
            class="w-100 d-flex flex-col"
          />
        </div>
        <div class="search-icon">
          <QIcon :name="ionSearch" color="primary" size="sm" />
        </div>
      </div>
      <QList class="event-participants-list">
        <p v-if="participations.length === 0">
          {{ $t('eventParticipantsModal.noParticipants') }}
        </p>
        <QExpansionItem
          v-if="notVerifiedParticipations.length > 0"
          :label="$t('eventParticipantsModal.verifyParticipants')"
          default-opened
          v-model="isNotVerifiedExpanded"
          :expand-icon="ionChevronDown"
          header-class="participants-collapsible-header"
        >
          <EventParticipantsListItem
            v-for="participation in notVerifiedParticipations"
            :key="participation.id"
            :participation="participation"
            :delete="true"
            :verify="true"
            :highlight="highlight"
            @on-verify-participation="verifyParticipation"
            @on-delete-participation="deleteParticipation"
          />
        </QExpansionItem>

        <QExpansionItem
          v-if="areCoordinatorParticipations.length > 0"
          :label="$t('eventParticipantsModal.coordinators')"
          v-model="isCoordinatorsExpanded"
          :expand-icon="ionChevronDown"
          header-class="participants-collapsible-header"
        >
          <EventParticipantsListItem
            v-for="participation in areCoordinatorParticipations"
            :key="participation.id"
            :participation="participation"
            :highlight="highlight"
            @on-delete-participation="deleteParticipation"
          />
        </QExpansionItem>

        <QExpansionItem
          v-if="areTeamCaptainsParticipations.length > 0"
          :label="$t('eventParticipantsModal.teamcaptains')"
          v-model="isTeamCaptainsExpanded"
          :default-opened="false"
          :expand-icon="ionChevronDown"
          header-class="participants-collapsible-header"
        >
          <EventParticipantsListItem
            v-for="participation in areTeamCaptainsParticipations"
            :key="participation.id"
            :participation="participation"
            :highlight="highlight"
            @on-delete-participation="deleteParticipation"
          />
        </QExpansionItem>

        <QExpansionItem
          v-if="verifiedParticipations.length > 0"
          :label="$t('eventParticipantsModal.verifiedParticipants')"
          v-model="isVerifiedExpanded"
          :default-opened="false"
          :expand-icon="ionChevronDown"
          header-class="participants-collapsible-header"
        >
          <EventParticipantsListItem
            v-for="participation in verifiedParticipations"
            :key="participation.id"
            :participation="participation"
            :invite="true"
            :delete="true"
            :highlight="highlight"
            @on-delete-participation="deleteParticipation"
            @on-invite-to-team-captain="handleInviteToTeamCaptain"
          />
        </QExpansionItem>
      </QList>
    </div>
  </div>
</template>

<style lang="scss">
.participants-collapsible-header {
  font-size: 21px;
  font-weight: 400;
  background-color: $grey-2;
  margin-top: 8px;
}
.event-participants-list {
  margin-top: 20px;
}
.search-icon {
  width: 42px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
