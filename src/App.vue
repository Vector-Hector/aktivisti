<template>
  <NavigationSidebar />
  <Toast position="top-right" />
  <IonApp>
    <div id="root">
      <IonHeader
        class="header-on-top"
      >
        <IonToolbar>
          <IonButtons slot="start">
            <transition
              :name="titleTransition"
            >
              <IonButton
                v-if="currentDepth <= 2"
                @click="openSidebar"
              >
                <IonIcon
                  name="menu-outline"
                />
              </IonButton>
              <IonButton
                v-else
                @click="backButton"
              >
                <IonIcon
                  name="arrow-back"
                />
              </IonButton>
            </transition>
          </IonButtons>
          <div class="title-wrapper">
            <span
              class="shadow-title"
              aria-hidden="true"
            >
              <AppTitle
                :title="$route.meta.title?.()"
                :subtitle="$route.meta.subtitle?.()"
              />
            </span>
            <transition :name="titleTransition">
              <AppTitle
                :key="$route.path"
                class="title"
                :title="$route.meta.title?.()"
                :subtitle="$route.meta.subtitle?.()"
              />
            </transition>
          </div>
        </IonToolbar>
      </IonHeader>
      <div id="main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <transition :name="pageTransition">
              <component :is="Component" />
            </transition>
          </keep-alive>
        </router-view>
      </div>
    </div>
  </IonApp>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationSidebar from '@/components/NavigationSidebar.vue'
import { uiStore } from '@/store/UiStore'
import { IonApp, IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/vue'
import Toast from 'primevue/toast'
import { addIcons } from 'ionicons'
import { menuOutline, arrowBack } from 'ionicons/icons'
import AppTitle from '@/components/AppTitle.vue'
import { ErrorBus } from '@/utils/errorBus'


addIcons({
  'menu-outline': menuOutline,
  'arrow-back': arrowBack
})

export default defineComponent({
  name: 'App',
  components: {
    AppTitle,
    NavigationSidebar,
    IonApp,
    Toast,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonIcon,
    IonBackButton,
    IonHeader
  },
  data() {
    return {
      items: [{
        label: 'Kampagnen',
        icon: 'pi pi-plus',
        to: '/campaigns'
      }, {
        label: 'Aktionen',
        icon: 'pi pi-fw pi-calendar',
        to: '/events'
      }],
      transitionDirection: null as string | null
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
    ErrorBus.on('error', (message: String) => {
      this.$toast.add({
        severity: 'error',
        summary: message
      })
    })
  },
  methods: {
    openSidebar() {
      uiStore.openSidebar()
    },
    backButton() {
      this.$router.go(-1)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '~@/scss/_globals.scss';
@import "~@/scss/_page-transitions.scss";

#root {
  display: flex;
  flex-direction: column;
}

.shadow-title {
  visibility: hidden;
}

.nav {
  padding-bottom: 100px;
}

.router-link {
  padding-right: 10px;
}


.dielinke-logo {
  max-width: 240px;
  cursor: pointer;
}

.p-menubar {
  background: white;
  border: 1px solid $red;
}

#main {
  flex: 1;
  position: relative;
  display: flex;
}

.header-on-top {
  z-index: 102;
}

.title-wrapper {
  position: relative;

  .title {
    top: 0;
    position: absolute;
  }
}
</style>
