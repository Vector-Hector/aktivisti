<script setup lang="ts">
import { computed } from 'vue'
import { uiStore } from 'src/store/UiStore'
import { userStore } from 'src/store/UserStore'
import { getAuthStore } from 'src/store/AuthStore'
import MenuLink from 'src/components/MenuLink.vue'
import OpenInvitationsBadge from 'components/OpenInvitationsBadge.vue'
import {
  ionCalendarClearOutline,
  ionCalendarOutline,
  ionClose,
  ionExitOutline,
  ionLogIn,
  ionMenu,
  ionPersonCircleOutline,
  ionPeopleOutline,
  ionHomeOutline,
  ionPersonAddOutline,
  ionHelpCircleOutline,
  ionStatsChartOutline
} from '@quasar/extras/ionicons-v5'
import { QBtn, QDrawer, QIcon, QScrollArea } from 'quasar'
import { farIdCard } from '@quasar/extras/fontawesome-v5'
import { useRouter } from 'vue-router'

const $router = useRouter()
const authStore = getAuthStore()

const version = computed(() => {
  return process.env.APP_VERSION!
})
const sidebarIcon = computed(() => {
  return sidebarExpanded.value ? ionClose : ionMenu
})
const isLoggedIn = computed(() => {
  return authStore.isLoggedIn()
})
const hasManagePermission = computed(() => {
  return userStore.hasAtLeastOneManagePermission()
})
const isTeamCaptainOrLocalCoordinator = computed(() => {
  return userStore.isTeamCaptainOrLocalCoordinator()
})
const isAdminOrGlobalCoordinator = computed(() => {
  return userStore.isAdminOrGlobalCoordinator()
})
const userName = computed(() => {
  return userStore.getState().user?.username
})
const userFullname = computed(() => {
  const first_name = userStore.getState().user?.first_name
  const last_name = userStore.getState().user?.last_name
  return [first_name, last_name].filter(Boolean).join(' ')
})
const sidebarExpanded = computed({
  get(): boolean {
    return uiStore.getState().sidebarExpanded
  },
  set(value: boolean) {
    uiStore.toggleSidebar(value)
  }
})
const helpUrl = computed(() => {
  return process.env.APP_HELP_URL as string
})

function logout() {
  void authStore.logout()
  void userStore.reset()
  void $router.push('/')
}
</script>

<template>
  <QDrawer
    side="right"
    overlay
    class="navigation-sidebar overlay-shadow"
    v-model="sidebarExpanded"
  >
    <QBtn
      :icon="sidebarIcon"
      @click="sidebarExpanded = !sidebarExpanded"
      class="menu-button"
      :class="{
        'navbar-expanded': sidebarExpanded
      }"
      round
    />
    <div class="menu">
      <div v-if="isLoggedIn" class="menu-group highlighted">
        <div class="user-widget">
          <MenuLink to="/profile">
            <div class="user-widget-avatar">
              <QIcon
                :name="ionPersonCircleOutline"
                class="avatar-placeholder"
              />
            </div>
            <div class="user-widget-details">
              <span v-if="userFullname.length > 0" class="name">{{
                userFullname
              }}</span>
              <span class="username">@{{ userName }}</span>
            </div>
          </MenuLink>
        </div>
      </div>
      <div v-if="!isLoggedIn" class="menu-group highlighted">
        <QBtn
          :icon="ionClose"
          @click="sidebarExpanded = false"
          class="close-sidebar-button"
          flat
          round
        />
        <div class="menu-item">
          <MenuLink to="/login">
            <QIcon class="menu-item-icon" :name="ionLogIn" />
            <span class="menu-item-link-text">Anmelden</span>
          </MenuLink>
        </div>
        <hr class="menu-divider" />
        <div class="menu-item">
          <MenuLink to="/register">
            <QIcon class="menu-item-icon" :name="farIdCard" />
            <span class="menu-item-link-text">Registrieren</span>
          </MenuLink>
        </div>
      </div>
      <QScrollArea class="scroll-area">
        <div class="menu-group">
          <div v-if="isLoggedIn" class="menu-item">
            <MenuLink :to="{ name: 'my-participations' }">
              <QIcon class="menu-item-icon" :name="ionCalendarOutline" />
              <span class="menu-item-link-text">Meine Teilnahmen</span>
              <OpenInvitationsBadge />
            </MenuLink>
          </div>
          <div v-if="isLoggedIn" class="menu-item">
            <MenuLink to="/events">
              <QIcon class="menu-item-icon" :name="ionCalendarClearOutline" />
              <span class="menu-item-link-text">Alle Aktionen</span>
            </MenuLink>
          </div>
          <div v-if="isLoggedIn" class="menu-item">
            <MenuLink to="/offices">
              <QIcon class="menu-item-icon" :name="ionHomeOutline" />
              <span class="menu-item-link-text">Die Linke vor Ort</span>
            </MenuLink>
          </div>
          <div v-if="hasManagePermission" class="menu-item">
            <MenuLink to="/posters">
              <QIcon
                class="menu-item-icon"
                name="img:/static/icons/poster.svg"
              />
              <span class="menu-item-link-text">Plakate</span>
            </MenuLink>
          </div>
          <div v-if="hasManagePermission" class="menu-item">
            <MenuLink :to="{ name: 'reports' }">
              <QIcon class="menu-item-icon" :name="ionStatsChartOutline" />
              <span class="menu-item-link-text">Statistiken</span>
            </MenuLink>
          </div>
          <div
            v-if="isTeamCaptainOrLocalCoordinator || isAdminOrGlobalCoordinator"
            class="menu-item"
          >
            <MenuLink :to="{ name: 'manage-users' }">
              <QIcon class="menu-item-icon" :name="ionPeopleOutline" />
              <span class="menu-item-link-text">Benutzer*innen verwalten</span>
            </MenuLink>
          </div>
          <div
            v-if="isTeamCaptainOrLocalCoordinator || isAdminOrGlobalCoordinator"
            class="menu-item"
          >
            <MenuLink :to="{ name: 'create-lead-general' }">
              <QIcon class="menu-item-icon" :name="ionPersonAddOutline" />
              <span class="menu-item-link-text">Kontakt registrieren</span>
            </MenuLink>
          </div>
        </div>

        <div class="menu-group menu-bottom">
          <div class="version">Version: {{ version }}</div>
          <hr class="menu-divider" />
          <div class="menu-item">
            <a class="menu-item-link" :href="helpUrl" target="_blank">
              <QIcon class="menu-item-icon" :name="ionHelpCircleOutline" />
              <span class="menu-item-link-text">Hilfe</span>
            </a>
          </div>
          <div class="menu-item">
            <MenuLink to="/imprint">
              <span class="menu-item-icon paragraph-icon">§</span>
              <span class="menu-item-link-text">Impressum / Datenschutz</span>
            </MenuLink>
          </div>
          <div v-if="isLoggedIn" class="menu-item">
            <div class="menu-item-link" @click="logout()">
              <QIcon class="menu-item-icon" :name="ionExitOutline" />
              <span class="menu-item-link-text">Abmelden</span>
            </div>
          </div>
        </div>
      </QScrollArea>
    </div>
  </QDrawer>
</template>

<style lang="scss" scoped>
.scroll-area {
  height: 100%;
}

::v-global(body.platform-ios .navigation-sidebar) {
  padding: calc(env(safe-area-inset-top) - 0.7rem) 0 0 !important;
  background: $primary;
}

body.platform-ios {
  .menu-button {
    top: env(safe-area-inset-top);
  }
}

::v-deep(.navigation-sidebar) {
  position: relative;
  overflow: visible;

  .menu-button {
    visibility: visible !important;
    color: $grey-8;
    background: $white;
    transform: none;
    transition: all 100ms linear;
    position: absolute;
    z-index: 9000;
    top: 0.5rem;
    left: -3.5rem;

    &.navbar-expanded {
      left: -1.3rem;
    }
  }
}

.dielinke-logo {
  max-width: 240px;
  cursor: pointer;
}

.menu {
  display: flex;
  flex-direction: column;
  height: 100%;
}

::v-deep(.menu-group) {
  background: $white;

  .menu-divider {
    color: $grey-4;
    opacity: 0.5;
    margin: 0;
  }

  &.highlighted {
    background: $primary;

    .menu-divider {
      color: white;
    }
  }

  .menu-item-link {
    cursor: pointer;
    color: $text-primary;

    .menu-item-icon {
      width: 1rem;
    }
  }

  &.highlighted {
    .menu-item-link {
      color: $text-inverted;
    }
  }

  .menu-item {
    font-size: 1rem;
    padding: 1.2rem;
  }

  .menu-item-link {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .menu-item-link-text {
    margin-left: 10px;
    margin-right: 10px;
  }
}

hr {
  border-width: thin;
}

.close-sidebar-button {
  position: absolute;
  right: 0;
  color: $white !important;
}

.menu-bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.user-widget {
  color: $text-inverted;
  display: flex;

  .user-widget-avatar {
    padding: 1.8rem;

    .avatar-placeholder {
      font-size: 3.8em;
    }
  }

  .user-widget-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    span {
      padding: 0.3rem 0;
    }
  }
}

.paragraph-icon {
  font-size: 0.9rem;
  text-align: center;
}

.version {
  align-self: flex-end;
  color: $grey-6;
}
</style>
