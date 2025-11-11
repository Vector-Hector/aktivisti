<script setup lang="ts">
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { ionClose, ionCheckmark } from '@quasar/extras/ionicons-v5'
import { matArrowCircleUp } from '@quasar/extras/material-icons'
import { QBtn, QItem, QItemLabel, QItemSection } from 'quasar'

interface Props {
  participation: EventParticipationDto
  invite?: boolean
  delete?: boolean
  verify?: boolean
}

interface Emits {
  (e: 'onDeleteParticipation', id: number): void
  (e: 'onInviteToTeamCaptain', userId: number, username: string): void
  (e: 'onVerifyParticipation', id: number): void
}

const props = withDefaults(defineProps<Props>(), {
  invite: false,
  delete: true,
  verify: false
})
const emit = defineEmits<Emits>()

function handleDeleteParticipation(id: number): void {
  emit('onDeleteParticipation', id)
}

function handleInviteToTeamCaptain(userId: number, username: string): void {
  emit('onInviteToTeamCaptain', userId, username)
}

function handleVerifyParticipation(id: number): void {
  emit('onVerifyParticipation', id)
}
</script>
<template>
  <QItem class="participants-list-item-wrapper">
    <QItemSection>
      <QItemLabel v-if="props.participation.user_is_member">
        <QItemLabel lines="1"
          ><b>{{ props.participation.user_username }} </b></QItemLabel
        >
        <QItemLabel caption>{{ props.participation.user_email }}</QItemLabel>
      </QItemLabel>
      <QItemLabel v-else>
        {{ props.participation.user_email }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side>
      <div>
        <QBtn
          fill="none"
          size="md"
          :icon="ionClose"
          dense
          flat
          round
          @click="handleDeleteParticipation(props.participation.id)"
          :aria-label="$t('eventParticipantsModal.removeParticipant')"
        />
        <QBtn
          v-if="
            props.invite &&
            !props.participation.is_team_captain &&
            !props.participation.is_event_coordinator
          "
          fill="none"
          size="md"
          :icon="matArrowCircleUp"
          dense
          flat
          round
          @click="
            handleInviteToTeamCaptain(
              props.participation.user,
              props.participation.user_username
            )
          "
          :aria-label="
            $t('eventParticipantsModal.promoteUserToTeamcamptain.label')
          "
        />
        <QBtn
          v-if="props.verify && !props.participation.is_verified"
          fill="none"
          size="md"
          color="positive"
          :icon="ionCheckmark"
          dense
          flat
          round
          @click="handleVerifyParticipation(props.participation.id)"
        />
      </div>
    </QItemSection>
  </QItem>
</template>
<style lang="scss" scoped>
.participants-list-item-wrapper {
  width: 97%;
  margin: auto;
  background-color: $grey-1;
}
</style>
