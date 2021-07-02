<template>
  <QDrawer
    side="right"
    class="navigation-sidebar overlay-shadow"
    overlay
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
      <div
        v-if="isLoggedIn"
        class="menu-group highlighted"
      >
        <div class="user-widget">
          <div class="user-widget-avatar">
            <QIcon :name="ionPersonCircleOutline" class="avatar-placeholder" />
          </div>
          <div class="user-widget-details">
            <span v-if="userFullname.length>0" class="name">{{ userFullname }}</span>
            <span class="username">{{ userName }}</span>
          </div>
        </div>
        <div class="menu-item">
          <MenuLink
            to="/profile"
          >
            <QIcon :name="ionPersonOutline" />
            <span class="menu-item-link-text">Mein Profil</span>
          </MenuLink>
        </div>
      </div>
      <div
        v-if="!isLoggedIn"
        class="menu-group highlighted"
      >
        <QBtn
          :icon="ionClose"
          @click="sidebarExpanded = false"
          class="close-sidebar-button"
          flat
          round
        />
        <div class="menu-item">
          <MenuLink
            to="/login"
          >
            <QIcon :name="ionLogIn" />
            <span class="menu-item-link-text">Anmelden</span>
          </MenuLink>
        </div>
        <hr class="menu-divider">
        <div class="menu-item">
          <MenuLink
            to="/register"
          >
            <QIcon :name="farIdCard" />
            <span class="menu-item-link-text">Registrieren</span>
          </MenuLink>
        </div>
      </div>
      <div class="menu-group">
        <div class="menu-item">
          <MenuLink
            to="/events"
          >
            <QIcon
              :name="ionCalendarClearOutline"
            />
            <span class="menu-item-link-text">Alle Aktionen</span>
          </MenuLink>
        </div>
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <MenuLink
            :to="{ name: 'my-events' }"
          >
            <QIcon :name="ionCalendarOutline" />
            <span class="menu-item-link-text">Meine Aktionen</span>
            <OpenInvitationsBadge />
          </MenuLink>
        </div>
        <div
          v-if="hasCreatePermission"
          class="menu-item"
        >
          <MenuLink
            :to="{ name: 'edit-event-details-new' }"
          >
            <QIcon :name="farCalendarPlus" />
            <span class="menu-item-link-text">Aktion Erstellen</span>
          </MenuLink>
        </div>
      </div>
      <div class="menu-group menu-bottom">
        <hr class="menu-divider">
        <div class="menu-item">
          <MenuLink to="/imprint">
            <span class="paragraph-icon">§</span>
            <span class="menu-item-link-text">Impressum / Datenschutz</span>
          </MenuLink>
        </div>
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <div
            class="menu-item-link"
            @click="logout()"
          >
            <QIcon :name="ionExitOutline" />
            <span class="menu-item-link-text">Abmelden</span>
          </div>
        </div>
      </div>
    </div>
  </QDrawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uiStore } from 'src/store/UiStore'
import { userStore } from 'src/store/UserStore'
import { authStore } from 'src/store/AuthStore'
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
  ionPersonOutline
} from '@quasar/extras/ionicons-v5'
import { QBtn, QDrawer, QIcon } from 'quasar'
import { farCalendarPlus, farIdCard } from '@quasar/extras/fontawesome-v5'


export default defineComponent({
  name: 'NavigationSidebar',
  components: {
    OpenInvitationsBadge,
    MenuLink,
    QBtn,
    QDrawer,
    QIcon
  },
  data() {
    return {
      farCalendarPlus,
      farIdCard,
      ionCalendarOutline,
      ionCalendarClearOutline,
      ionClose,
      ionExitOutline,
      ionLogIn,
      ionPersonCircleOutline,
      ionPersonOutline
    }
  },
  computed: {
    sidebarIcon(): boolean {
      return this.sidebarExpanded ? ionClose : ionMenu
    },
    isLoggedIn() {
      return authStore.isLoggedIn()
    },
    hasCreatePermission() {
      return userStore.hasAtLeastOneManagePermission()
    },
    userName() {
      return userStore.getState().user?.username
    },
    userFullname() {
      const first_name = userStore.getState().user?.first_name
      const last_name = userStore.getState().user?.last_name
      return [first_name, last_name].filter(Boolean).join(' ')
    },
    sidebarExpanded: {
      get(): boolean {
        return uiStore.getState().sidebarExpanded
      },
      set(value: boolean) {
        uiStore.toggleSidebar(value)
      }
    }
  },
  methods: {
    logout() {
      void authStore.logout()
      void this.$router.push('/')
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/_globals.scss';

.navigation-sidebar {
  padding: 0;
  position: relative;

  .menu-button {
    visibility: visible !important;
    color: $gray-600;
    background: $white;
    margin: 0.5rem 0;
    transform: none;
    transition: all 100ms linear;
    position: absolute;
    z-index: 9000;
    top: 0;
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
    color: $gray-500;
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
}


</style>
