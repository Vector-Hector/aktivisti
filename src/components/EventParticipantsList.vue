<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import {
  ionClose,
  ionCheckmark,
  ionChevronDown
} from '@quasar/extras/ionicons-v5'
import { matArrowCircleUp } from '@quasar/extras/material-icons'
import {
  QBtn,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  useQuasar,
  QExpansionItem
} from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

interface Props {
  eventId: number
  eventSubAssociation?: number
}

const props = defineProps<Props>()
const participations = ref<EventParticipationDto[]>([])

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

const verifiedParticipations = computed(() => {
  return participations.value.filter(
    ({ is_verified, is_team_captain, is_event_coordinator }) =>
      !is_team_captain && !is_event_coordinator && is_verified
  )
})
const notVerifiedParticipations = computed(() => {
  return participations.value.filter(
    ({ is_verified, is_team_captain, is_event_coordinator }) =>
      !is_team_captain && !is_event_coordinator && !is_verified
  )
})
const areTeamCaptainsParticipations = computed(() => {
  return participations.value.filter(
    ({ is_team_captain, is_event_coordinator }) =>
      !is_event_coordinator && is_team_captain
  )
})

const areCoordinatorParticipations = computed(() => {
  return participations.value.filter(
    ({ is_event_coordinator }) => is_event_coordinator
  )
})

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
      <QList>
        <p
          v-if="
            verifiedParticipations.length === 0 &&
            notVerifiedParticipations.length === 0
          "
        >
          {{ $t('eventParticipantsModal.noOneWaitingToGetVerified') }}
        </p>
        <QExpansionItem
          v-if="notVerifiedParticipations.length > 0"
          :label="$t('eventParticipantsModal.verifyParticipants')"
          default-opened
          :expand-icon="ionChevronDown"
          group="participantsGroup"
          header-class="participats-collapsable-header"
        >
          <QItem
            v-for="participation in notVerifiedParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <q-item-label lines="1"
                  ><b>{{ participation.user_username }} </b></q-item-label
                >
                <q-item-label caption>{{
                  participation.user_email
                }}</q-item-label>
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>

            <QItemSection side>
              <div class="invitation-item-actions">
                <QBtn
                  fill="none"
                  size="md"
                  dense
                  flat
                  round
                  :aria-label="$t('eventParticipantsModal.removeParticipant')"
                  :icon="ionClose"
                  @click="deleteParticipation(participation.id)"
                />
                <QBtn
                  fill="none"
                  size="md"
                  color="positive"
                  :icon="ionCheckmark"
                  dense
                  flat
                  round
                  @click="verifyParticipation(participation.id)"
                />
              </div>
            </QItemSection>
          </QItem>
        </QExpansionItem>

        <QExpansionItem
          v-if="areCoordinatorParticipations.length > 0"
          :label="$t('eventParticipantsModal.coordinators')"
          :expand-icon="ionChevronDown"
          group="participantsGroup"
          header-class="participats-collapsable-header"
        >
          <QItem
            v-for="participation in areCoordinatorParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <q-item-label lines="1"
                  ><b>{{ participation.user_username }} </b></q-item-label
                >
                <q-item-label caption>{{
                  participation.user_email
                }}</q-item-label>
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>

            <QItemSection side>
              <div class="invitation-item-actions">
                <QBtn
                  fill="none"
                  size="md"
                  dense
                  flat
                  round
                  :aria-label="$t('eventParticipantsModal.removeParticipant')"
                  :icon="ionClose"
                  @click="deleteParticipation(participation.id)"
                />
              </div>
            </QItemSection>
          </QItem>
        </QExpansionItem>

        <QExpansionItem
          v-if="areTeamCaptainsParticipations.length > 0"
          :label="$t('eventParticipantsModal.teamcaptains')"
          :default-opened="false"
          :expand-icon="ionChevronDown"
          group="participantsGroup"
          header-class="participats-collapsable-header"
        >
          <QItem
            v-for="participation in areTeamCaptainsParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <q-item-label lines="1"
                  ><b>{{ participation.user_username }} </b></q-item-label
                >
                <q-item-label caption>{{
                  participation.user_email
                }}</q-item-label>
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>
            <QItemSection side>
              <div class="invitation-item-actions">
                <QBtn
                  fill="none"
                  size="md"
                  :icon="ionClose"
                  dense
                  flat
                  round
                  @click="deleteParticipation(participation.id)"
                  :aria-label="$t('eventParticipantsModal.removeParticipant')"
                />
              </div>
            </QItemSection>
          </QItem>
        </QExpansionItem>

        <QExpansionItem
          v-if="verifiedParticipations.length > 0"
          :label="$t('eventParticipantsModal.verifiedParticipants')"
          :default-opened="false"
          :expand-icon="ionChevronDown"
          group="participantsGroup"
          header-class="participats-collapsable-header"
        >
          <QItem
            v-for="participation in verifiedParticipations"
            :key="participation.id"
          >
            <QItemSection>
              <QItemLabel v-if="participation.user_is_member">
                <q-item-label lines="1"
                  ><b>{{ participation.user_username }} </b></q-item-label
                >
                <q-item-label caption>{{
                  participation.user_email
                }}</q-item-label>
              </QItemLabel>
              <QItemLabel v-else>
                {{ participation.user_email }}
              </QItemLabel>
            </QItemSection>

            <QItemSection side>
              <div class="invitation-item-actions">
                <QBtn
                  fill="none"
                  size="md"
                  :icon="ionClose"
                  dense
                  flat
                  round
                  @click="deleteParticipation(participation.id)"
                  :aria-label="$t('eventParticipantsModal.removeParticipant')"
                />
                <QBtn
                  v-if="!participation.is_event_coordinator"
                  fill="none"
                  size="md"
                  :icon="matArrowCircleUp"
                  dense
                  flat
                  round
                  @click="
                    handleInviteToTeamCaptain(
                      participation.user,
                      participation.user_username
                    )
                  "
                  :aria-label="
                    $t('eventParticipantsModal.promoteUserToTeamcamptain.label')
                  "
                />
              </div>
            </QItemSection>
          </QItem>
        </QExpansionItem>
      </QList>
    </div>
  </div>
</template>

<style lang="scss">
.participats-collapsable-header {
  font-size: 21px;
  font-weight: 400;
}
</style>
