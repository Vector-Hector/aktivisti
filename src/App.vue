<template>
  <PageLoadingSpinner
    v-if="!initialized"
  />
  <QLayout
    v-else
    view="hHr LpR ffr"
  >
    <QHeader
      class="bg-primary text-white"
      elevated
    >
      <QToolbar
        class="toolbar"
      >
        <QBtn
          v-if="currentDepth > 2  || $route.meta.isShowBackButton"
          @click="backButton"
          :icon="ionArrowBack"
          flat
          round
          :ripple-effect="false"
        />
        <QToolbarTitle class="title-wrapper col">
          <span class="title">
            {{ $route.meta.title?.() }}
          </span>
          <span class="subtitle">
            {{ $route.meta.subtitle?.() }}
          </span>
        </QToolbarTitle>
        <QToolbarTitle class="subtitle">
        </QToolbarTitle>

      </QToolbar>

    </QHeader>
    <NavigationSidebar />
    <QPageContainer
      class="d-flex flex-fill page-container"
    >
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </QPageContainer>
  </QLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationSidebar from 'src/components/NavigationSidebar.vue'
import { uiStore } from 'src/store/UiStore'
import AppTitle from 'src/components/AppTitle.vue'
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID, NO_INTERNET, USER_NOT_FOUND } from 'src/utils/errorBus'
import { QToolbar, QBtn, QPageContainer, QLayout, QHeader, QToolbarTitle } from 'quasar'
import { ionArrowBack } from '@quasar/extras/ionicons-v5'
import { IntervalDebouncer } from 'src/utils/debounce'
import { apiClient } from 'src/api/ApiClient'
import { configStore } from 'src/store/ConfigStore'
import { getAuthStore } from 'src/store/AuthStore'
import { userStore } from 'src/store/UserStore'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { VersionHealth } from 'src/api/model/ConfigDto'

const authStore = getAuthStore()

export default defineComponent({
  name: 'App',
  components: {
    PageLoadingSpinner,
    AppTitle,
    NavigationSidebar,
    QToolbar,
    QBtn,
    QPageContainer,
    QLayout,
    QToolbarTitle,
    QHeader
  },
  data() {
    return {
      initialized: false,
      transitionDirection: null as string | null,
      ionArrowBack
    }
  },
  computed: {
    currentDepth(): number {
      return this.$route.path.split('/').filter(item => !!item).length
    },
    sidebarExpanded() {
      return uiStore.getState().sidebarExpanded
    }
  },
  watch: {
    '$route'(to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length

      if (toDepth === fromDepth) {
        this.transitionDirection = null
      } else {
        this.transitionDirection = toDepth < fromDepth ? 'right' : 'left'
      }
    }
  },
  async created() {
    // Retrieve config
    try {
      const configRequest = await apiClient.config.get()
      configStore.setServiceConfig(configRequest.payload.data)
    } catch (e) {
      ErrorBus.emit(NO_INTERNET)
    }
    // Check version health and show warnings / errors
    switch (configStore.state.service_config.version_health) {
    case VersionHealth.UNKNOWN:
      this.$q.notify({
        color: 'warning',
        message: 'Diese App-Version ist unbekannt und wird nicht unterstützt. ' +
          'Bitte lade eine neue Version aus offiziellen Quellen.'
      })
      break
    case VersionHealth.OBSOLETE:
      this.$q.notify({
        color: 'negative',
        message: 'Diese App-Version ist kritisch veraltet und wird nicht mehr unterstützt. ' +
          'Du musst die Seite neu laden oder ein Update durchführen, ansonsten wird die App vermutlich Fehler produzieren.'
      })
      break
    case VersionHealth.DEPRECATED:
      this.$q.notify({
        color: 'warning',
        message: 'Es gibt eine neuere Version dieser App. Bitte führe ein Update durch.'
      })
      break
    }
    // hydrate profile on app start
    if (authStore.isLoggedIn()) {
      try {
        const profileRequest = await apiClient.user.get('me', ['sub_association'])
        const permissionRequest = await apiClient.userPermissions.list({user: profileRequest.payload.data.id})
        userStore.setUser(profileRequest.payload.data)
        userStore.setHomeAssociation(profileRequest.payload.embedded?.sub_association?.[0] ?? null)
        userStore.setPermissions(permissionRequest.payload.data)
      } catch (error: any) {
        if (error.response?.status === 403) {
          authStore.clear()
        } else {
          ErrorBus.emit(NO_INTERNET)
        }
      }
    }
    this.initialized = true
  },
  mounted() {
    const debouncer = new IntervalDebouncer()
    ErrorBus.on(SESSION_INVALID, (message: string) => {
      debouncer.executeDebounced(() => {
        this.$q.notify({
          type: 'warning',
          message: message
        })
        void this.$router.push({name: 'login'})
      })
    })
    ErrorBus.on(NOT_AUTHORIZED, (message: string) => {
      this.$q.notify({
        type: 'negative',
        message: message
      })
    })
    ErrorBus.on(USER_NOT_FOUND, (message: string) => {
      this.$q.notify({
        type: 'negative',
        message: message
      })
    })
    ErrorBus.on(NO_INTERNET, () => {
      debouncer.executeDebounced(() => {
        this.$q.notify({
          type: 'negative',
          timeout: 5000,
          message: 'Die Internetverbindung steht derzeit nicht zur Verfügung oder der ' +
            'App-Dienst konnte nicht erreicht werden, versuche es später noch einmal'
        })
      })
    })
  },
  methods: {
    toggleSidebar() {
      uiStore.toggleSidebar(!uiStore.getState().sidebarExpanded)
    },
    backButton() {
      this.$router.go(-1)
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

.title {
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  white-space: nowrap;
  width: calc(100%);
  overflow: hidden;
}

.subtitle {
  color: $grey-1;
  font-size: 0.7rem;
  font-weight: 400;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  white-space: nowrap;
  width: calc(100%);
  overflow: hidden;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 58px;
}

.page-container {
  height: 100%;
  overflow: hidden;
}

</style>
