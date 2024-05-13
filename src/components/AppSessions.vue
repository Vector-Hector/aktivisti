<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AppSessionDto, AppSessionType } from 'src/api/model/AppSessionDto'
import { QBtn, QIcon, QItem, QItemLabel, QItemSection, QList } from 'quasar'
import {
  ionDesktopOutline,
  ionPhonePortraitOutline
} from '@quasar/extras/ionicons-v5'
import { apiClient } from 'src/api/ApiClient'

const sessions = ref<AppSessionDto[]>([])

onMounted(async () => {
  await refreshSessions()
})
async function revokeSession(sessionId: string) {
  await apiClient.appSessions.delete(sessionId.toString())
  await refreshSessions()
}
async function refreshSessions() {
  sessions.value = (await apiClient.appSessions.list()).payload.data
}
</script>
<template>
  <QList separator>
    <QItem v-for="session in sessions" :key="session.id">
      <QItemSection side top>
        <QIcon
          :name="
            session.session_type === AppSessionType.MOBILE_APP
              ? ionPhonePortraitOutline
              : ionDesktopOutline
          "
          size="small"
        />
      </QItemSection>
      <QItemSection>
        <QItemLabel
          ><b>{{ session.user_agent_browser }}</b></QItemLabel
        >
        <QItemLabel
          >{{ session.user_agent_os
          }}{{
            session.user_agent_os_version
              ? ' ' + session.user_agent_os_version
              : session.user_agent_os_version
          }}
        </QItemLabel>
        <QItemLabel>
          seit: {{ $utils.dateFormat(session.created_at) }}
        </QItemLabel>
        <QItemLabel caption v-if="session.is_active">
          <span class="current-session-info"> Aktuelle Sitzung </span>
        </QItemLabel>
      </QItemSection>
      <QItemSection v-if="!session.is_active" side top>
        <QBtn color="primary" @click="() => revokeSession(session.id)">
          Abmelden
        </QBtn>
      </QItemSection>
    </QItem>
  </QList>
</template>
<style lang="scss" scoped>
.current-session-info {
  color: #6ab173;
}
</style>
