<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import NavigationSidebar from 'src/components/NavigationSidebar.vue'
import {
  ErrorBus,
  NOT_AUTHORIZED,
  SESSION_INVALID,
  NO_INTERNET,
  USER_NOT_FOUND
} from 'src/utils/errorBus'
import {
  QToolbar,
  QBtn,
  QPageContainer,
  QLayout,
  QHeader,
  QToolbarTitle,
  useQuasar,
  QLinearProgress
} from 'quasar'
import { ionArrowBack } from '@quasar/extras/ionicons-v5'
import { IntervalDebouncer } from 'src/utils/debounce'
import { apiClient } from 'src/api/ApiClient'
import { configStore } from 'src/store/ConfigStore'
import { getAuthStore } from 'src/store/AuthStore'
import { useUserStore } from './stores/user'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { VersionHealth } from 'src/api/model/ConfigDto'
import { useRoute, useRouter } from 'vue-router'
import { GlobalLoadingInjectionKey } from 'src/utils/app'
import { useI18n } from 'vue-i18n'

const authStore = getAuthStore()
const $route = useRoute()
const $router = useRouter()
const $q = useQuasar()
const { t } = useI18n()
const userStore = useUserStore()

const initialized = ref(false)
const transitionDirection = ref<string | null>(null)
const loading = ref<boolean>(false)
provide(GlobalLoadingInjectionKey, loading)

const currentDepth = computed(() => {
  return $route.path.split('/').filter((item) => !!item).length
})

watch($route, (to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length

  if (toDepth === fromDepth) {
    transitionDirection.value = null
  } else {
    transitionDirection.value = toDepth < fromDepth ? 'right' : 'left'
  }
})

onMounted(async () => {
  // Retrieve config
  try {
    const configRequest = await apiClient.config.get()
    configStore.setServiceConfig(configRequest.payload.data)
  } catch {
    ErrorBus.emit(NO_INTERNET)
  }
  // Check version health and show warnings / errors
  switch (configStore.state.service_config.version_health) {
    case VersionHealth.UNKNOWN:
      $q.notify({
        color: 'warning',
        message: t('app.versionUnknownError')
      })
      break
    case VersionHealth.OBSOLETE:
      $q.notify({
        color: 'negative',
        message: t('app.versionObsoleteError')
      })
      break
    case VersionHealth.DEPRECATED:
      $q.notify({
        color: 'warning',
        message: t('app.versionDeprecatedError')
      })
      break
  }
  // hydrate profile on app start
  if (authStore.isLoggedIn()) {
    try {
      const profileRequest = await apiClient.user.get('me', ['sub_association'])
      const permissionRequest = await apiClient.userPermissions.list({
        user: profileRequest.payload.data.id
      })
      userStore.setUser(profileRequest.payload.data)
      userStore.setHomeAssociation(
        profileRequest.payload.embedded?.sub_association?.[0] ?? null
      )
      userStore.setPermissions(permissionRequest.payload.data)
    } catch (error: any) {
      if (error.response?.status === 403) {
        authStore.clear()
      } else {
        ErrorBus.emit(NO_INTERNET)
      }
    }
  }
  initialized.value = true

  const debouncer = new IntervalDebouncer()
  ErrorBus.on(SESSION_INVALID, (message: string) => {
    debouncer.executeDebounced(() => {
      $q.notify({
        type: 'warning',
        message: message
      })
      void $router.push({ name: 'login' })
    })
  })
  ErrorBus.on(NOT_AUTHORIZED, (message: string) => {
    $q.notify({
      type: 'negative',
      message: message
    })
  })
  ErrorBus.on(USER_NOT_FOUND, (message: string) => {
    $q.notify({
      type: 'negative',
      message: message
    })
  })
  ErrorBus.on(NO_INTERNET, () => {
    debouncer.executeDebounced(() => {
      $q.notify({
        type: 'negative',
        timeout: 5000,
        message: t('app.noInternetError')
      })
    })
  })
})

function backButton() {
  $router.go(-1)
}
</script>
<template>
  <PageLoadingSpinner v-if="!initialized" />
  <QLayout v-else view="hHr LpR ffr">
    <QHeader class="bg-primary text-white" elevated>
      <QToolbar class="toolbar">
        <QBtn
          v-if="currentDepth > 2 || $route.meta.isShowBackButton"
          @click="backButton"
          :icon="ionArrowBack"
          flat
          round
          :ripple-effect="false"
        />
        <QToolbarTitle class="title-wrapper col">
          <span class="title">
            {{ $route.meta.title?.(t) }}
          </span>
          <span class="subtitle">
            {{ $route.meta.subtitle?.(t) }}
          </span>
        </QToolbarTitle>
        <QToolbarTitle class="subtitle"></QToolbarTitle>
      </QToolbar>
      <QLinearProgress
        v-if="loading"
        class="progress-bar full-width"
        size="5px"
        color="white"
        indeterminate
      />
    </QHeader>
    <NavigationSidebar />
    <QPageContainer class="d-flex flex-fill page-container">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </QPageContainer>
  </QLayout>
</template>

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

.progress-bar {
  z-index: 1;
}
</style>
