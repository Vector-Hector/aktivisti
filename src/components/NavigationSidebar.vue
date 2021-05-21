<template>
  <Sidebar
    class="navigation-sidebar"
    :visible="sidebarExpanded"
    :show-close-icon="false"
    @update:visible="toggleSidebar"
  >
    <div class="menu">
      <div
        v-if="isLoggedIn"
        class="menu-group highlighted"
      >
        <div class="user-widget">
          <div class="user-widget-avatar">
            <i class="pi pi-user avatar-placeholder" />
          </div>
          <div class="user-widget-details">
            <span class="email">{{ userProfile?.email }}</span>
            <span class="username">@{{ userProfile?.username }}</span>
          </div>
        </div>
        <div class="menu-item">
          <router-link
            class="menu-item-link"
            to="/profile"
          >
            <i class="pi pi-user-edit" />
            <span class="menu-item-link-text">Mein Profil</span>
          </router-link>
        </div>
      </div>
      <div
        v-if="!isLoggedIn"
        class="menu-group highlighted"
      >
        <Button
          icon="pi pi-times"
          class="p-button-text p-button-rounded close-sidebar-button"
          @click="toggleSidebar(false)"
        />
        <div class="menu-item">
          <router-link
            class="menu-item-link"
            to="/login"
          >
            <i class="pi pi-sign-in" />
            <span class="menu-item-link-text">Einloggen</span>
          </router-link>
        </div>
        <hr class="menu-divider">
        <div class="menu-item">
          <router-link
            class="menu-item-link"
            to="/register"
          >
            <i class="pi pi-id-card" />
            <span class="menu-item-link-text">Registrieren</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group">
        <div class="menu-item">
          <router-link
            class="menu-item-link"
            to="/events"
          >
            <IonIcon name="calendar-clear-outline" />
            <span class="menu-item-link-text">Alle Aktionen</span>
          </router-link>
        </div>
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <router-link
            class="menu-item-link"
            :to="{ name: 'my-events' }"
          >
            <IonIcon name="calendar-outline" />
            <span class="menu-item-link-text">Meine Aktionen</span>
          </router-link>
        </div>
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <router-link
            class="menu-item-link"
            :to="{ name: 'edit-event-details-new' }"
          >
            <i class="pi pi-calendar-plus" />
            <span class="menu-item-link-text">Aktion Erstellen</span>
          </router-link>
        </div>
      </div>
      <div
        v-if="isManager"
        class="menu-group"
      >
        <hr class="menu-divider">
        <div class="menu-item">
          <router-link
            class="menu-item-link"
            to="/campaigns"
          >
            <i class="pi pi-info-circle" />
            <span class="menu-item-link-text">Kampagnen verwalten</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group menu-bottom">
        <hr class="menu-divider">
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <div
            class="menu-item-link"
            @click="logout()"
          >
            <i class="pi pi-sign-out" />
            <span class="menu-item-link-text">Ausloggen</span>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uiStore } from '@/store/UiStore'
import { userStore } from '@/store/UserStore'

import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import { authService } from '@/api/authService'
import { addIcons } from 'ionicons'
import { calendarOutline, calendarClearOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/vue'

addIcons({
  'calendar-outline': calendarOutline,
  'calendar-clear-outline': calendarClearOutline
})

export default defineComponent({
  name: 'NavigationSidebar',
  components: {
    Sidebar,
    Button,
    IonIcon
  },
  data() {
    return {}
  },
  computed: {
    isLoggedIn() {
      return authService.isLoggedIn()
    },
    isManager() {
      return userStore.isManager()
    },
    userProfile() {
      return userStore.getState().user
    },
    sidebarExpanded() {
      return uiStore.getState().sidebarExpanded
    }
  },
  watch: {
    $route: {
      handler() {
        this.toggleSidebar(false)
      }
    }
  },
  methods: {
    toggleSidebar(expanded: boolean) {
      uiStore.toggleSidebar(expanded)
    },
    logout() {
      authService.logout()
      this.$router.push('/')
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

.navigation-sidebar {
  padding: 0;
}

.dielinke-logo {
  max-width: 240px;
  cursor: pointer;
}

.p-sidebar {
  padding: 0;
}

/*
In this case the sidebar content is not reachable with ::v-slotted or ::v-deep as the opened sidebar is rendered
outside the html hierarchy of this component - if someone finds a better soltion, much appreciated
*/
::v-global(.p-sidebar-content) {
  height: 100%;
}

::v-global(.navigation-sidebar) {
  padding: 0 !important;
}

.menu {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-group {
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
  }
}

hr {
  border-width: thin;
}

.close-sidebar-button {
  position: absolute;
  right: 0;
  color: $white !important;

  &:focus {
    box-shadow: none;
  }
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


</style>
