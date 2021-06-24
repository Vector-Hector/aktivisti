<template>
  <QLayout view="hHr LpR ffr">
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
import { ErrorBus, NOT_AUTHORIZED, SESSION_INVALID } from 'src/utils/errorBus'
import { QToolbar, QBtn, QPageContainer, QLayout, QHeader, QToolbarTitle } from 'quasar'
import { ionArrowBack, ionMenu } from '@quasar/extras/ionicons-v5'
import { IntervalDebouncer } from 'src/utils/debounce'


export default defineComponent({
  name: 'App',
  components: {
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
    },
    pageTransition(): string {
      if (this.transitionDirection === null) {
        return 'fade'
      } else {
        return `slide-${this.transitionDirection}`
      }
    },
    titleTransition(): string {
      if (this.transitionDirection === null) {
        return 'fade'
      } else {
        return `fade-${this.transitionDirection}`
      }
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
