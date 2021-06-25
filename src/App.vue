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
      <QToolbar>
        <QBtn
          v-if="currentDepth > 2"
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
        <QBtn
          :icon="ionMenu"
          @click="toggleSidebar"
          dense
          flat
          round
        />
      </QToolbar>

    </QHeader>
    <NavigationSidebar />
    <QPageContainer
      class="d-flex"
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
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID, NO_INTERNET } from 'src/utils/errorBus'
import { QToolbar, QBtn, QPageContainer, QLayout, QHeader, QToolbarTitle } from 'quasar'
import { ionArrowBack, ionMenu } from '@quasar/extras/ionicons-v5'
import { IntervalDebouncer } from 'src/utils/debounce'
import { apiClient } from 'src/api/ApiClient'
import { configStore } from 'src/store/ConfigStore'
import { authService } from 'src/api/authService'
import { userStore } from 'src/store/UserStore'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'


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
      ionMenu,
      ionArrowBack
    }
  },
  computed: {
    currentDepth(): number {
      return this.$route.path.split('/').filter(item => !!item).length
    },
    showNavigation() {
      return uiStore.getState().showNavigation
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
    // hydrate profile on app start
    if (authService.isLoggedIn()) {
      try {
        const [profileRequest, permissionRequest] = await Promise.all([
          apiClient.user.get('me', ['sub_association']),
          apiClient.userPermissions.list(),
          apiClient.config.get()
        ])
        userStore.setUser(profileRequest.payload.data)
        userStore.setHomeAssociation(profileRequest.payload.embedded?.sub_association?.[0] ?? null)
        userStore.setPermissions(permissionRequest.payload.data)
      } catch (error: any) {
        console.log(error)
        if (error.status === 403) {
          authService.clear()
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
    ErrorBus.on(NO_INTERNET, () => {
      this.$q.notify({
        type: 'negative',
        timeout: 5000,
        message: message
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
@import 'src/css/_globals.scss';

.title {
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
}

.subtitle {
  color: $gray-100;
  font-size: 0.7rem;
  font-weight: 400;
  display: flex;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
}


</style>
