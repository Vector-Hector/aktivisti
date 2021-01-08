<template>
  <Sidebar class="navigation-sidebar" :visible="sidebarExpanded" @update:visible="toggleSidebar" :showCloseIcon="false">
    <div class="menu">
      <div class="menu-group highlighted" v-if="authState.loggedIn">
        <div class="user-widget">
          <div class="user-widget-avatar">
            <i class="pi pi-user avatar-placeholder"/>
          </div>
          <div class="user-widget-details">
            <span class="email">{{ authState.email }}</span>
            <span class="username">@{{ authState.username }}</span>
          </div>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/profile">
            <i class="pi pi-user-edit"/>
            <span class="menu-item-link-text">Mein Profil</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group highlighted" v-if="!authState.loggedIn">
        <Button icon="pi pi-times" @click="toggleSidebar(false)"
                class="p-button-text p-button-rounded close-sidebar-button"/>
        <div class="menu-item">
          <a class="menu-item-link" @click="login()">
            <i class="pi pi-sign-in"/>
            <span class="menu-item-link-text">Einloggen</span>
          </a>
        </div>
        <hr class="menu-divider"/>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/register">
            <i class="pi pi-id-card"/>
            <span class="menu-item-link-text">Registrieren</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group">
        <div class="menu-item">
          <router-link class="menu-item-link" to="/events">
            <i class="pi pi-calendar"/>
            <span class="menu-item-link-text">Alle Termine</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/map">
            <i class="pi pi-map-marker"/>
            <span class="menu-item-link-text">Termine auf Karte</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/contact">
            <i class="pi pi-users"/>
            <span class="menu-item-link-text">Kontakt zur LINKEN</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/material">
            <i class="pi pi-file"/>
            <span class="menu-item-link-text">Wahlkampfmaterial</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/campaign-select">
            <i class="pi pi-external-link"/>
            <span class="menu-item-link-text">Anderen Ort auswählen</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group" v-if="authState.loggedIn">
        <hr class="menu-divider"/>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/events">
            <i class="pi pi-check-circle"/>
            <span class="menu-item-link-text">Meine Termine</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/campaigns/new">
            <i class="pi pi-info-circle"/>
            <span class="menu-item-link-text">Kampagne erstellen</span>
          </router-link>
        </div>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/contact">
            <i class="pi pi-calendar-plus"/>
            <span class="menu-item-link-text">Event erstellen</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group menu-bottom">
        <hr class="menu-divider"/>
        <div class="menu-item">
          <router-link class="menu-item-link" to="/settings">
            <i class="pi pi-cog"/>
            <span class="menu-item-link-text">Einstellungen</span>
          </router-link>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uiStore } from '@/store/UiStore'
import { userStore } from '@/store/UserStore'

import Sidebar from 'primevue/components/sidebar/Sidebar'
import Button from 'primevue/components/button/Button'


export default defineComponent({
  name: 'NavigationSidebar',
  components: {
    Sidebar,
    Button
  },
  computed: {
    authState() {
      return userStore.getState()
    },
    sidebarExpanded() {
      return uiStore.getState().sidebarExpanded
    }
  },
  data() {
    return {}
  },
  methods: {
    toggleSidebar(expanded: boolean) {
      uiStore.toggleSidebar(expanded)
    },
    login() {
      userStore.mockLogin()
    }
  },
  watch: {
    $route: {
      handler() {
        this.toggleSidebar(false)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

.dielinke-logo {
  max-width: 240px;
  cursor: pointer;
}

.p-sidebar {
  padding: 0;
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

.navigation-sidebar {
  ::v-deep .p-sidebar-content {
    height: 100%;
  }
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
