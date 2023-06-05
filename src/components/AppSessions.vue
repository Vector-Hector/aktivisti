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
<script lang="ts">
import { defineComponent } from 'vue'
import { AppSessionDto, AppSessionType } from 'src/api/model/AppSessionDto'
import { QBtn, QIcon, QItem, QItemLabel, QItemSection, QList } from 'quasar'
import {
  ionDesktopOutline,
  ionPhonePortraitOutline
} from '@quasar/extras/ionicons-v5'

export default defineComponent({
  name: 'AppSessions',
  components: {
    QBtn,
    QIcon,
    QItem,
    QItemLabel,
    QItemSection,
    QList
  },
  data() {
    return {
      AppSessionType,
      ionPhonePortraitOutline,
      ionDesktopOutline,
      sessions: [] as AppSessionDto[]
    }
  },
  async created() {
    await this.refreshSessions()
  },
  methods: {
    async revokeSession(sessionId: number) {
      await this.$apiClient.appSessions.delete(sessionId.toString())
      await this.refreshSessions()
    },
    async refreshSessions() {
      this.sessions = (await this.$apiClient.appSessions.list()).payload.data
    }
  }
})
</script>
<style lang="scss" scoped>
.current-session-info {
  color: #6ab173;
}
</style>
