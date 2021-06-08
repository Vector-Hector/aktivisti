<template>
  <QDrawer
    side="right"
    class="navigation-sidebar"
    v-model="sidebarExpanded"
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
            <span v-if="userFullname.length>0" class="name">{{ userFullname }}</span>
            <span class="username">@{{ userName }}</span>
          </div>
        </div>
        <div class="menu-item">
          <MenuLink
            to="/profile"
          >
            <i class="pi pi-user-edit" />
            <span class="menu-item-link-text">Mein Profil</span>
          </MenuLink>
        </div>
      </div>
      <div
        v-if="!isLoggedIn"
        class="menu-group highlighted"
      >
        <Button
          icon="pi pi-times"
          class="p-button-text p-button-rounded close-sidebar-button"
          @click="sidebarExpanded = false"
        />
        <div class="menu-item">
          <MenuLink
            to="/login"
          >
            <i class="pi pi-sign-in" />
            <span class="menu-item-link-text">Anmelden</span>
          </MenuLink>
        </div>
        <hr class="menu-divider">
        <div class="menu-item">
          <MenuLink
            to="/register"
          >
            <i class="pi pi-id-card" />
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
              :name="ionCalendarClearOutline" />
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
          </MenuLink>
        </div>
        <div
          v-if="isLoggedIn"
          class="menu-item"
        >
          <MenuLink
            :to="{ name: 'edit-event-details-new' }"
          >
            <i class="pi pi-calendar-plus" />
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
            <i class="pi pi-sign-out" />
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
import Button from 'primevue/button'
import { authService } from 'src/api/authService'
import MenuLink from 'src/components/MenuLink.vue'
import { ionCalendarClearOutline, ionCalendarOutline } from '@quasar/extras/ionicons-v5'
import { QDrawer, QIcon } from 'quasar'


export default defineComponent({
  name: 'NavigationSidebar',
  components: {
    MenuLink,
    QDrawer,
    Button,
    QIcon
  },
  data() {
    return {
      ionCalendarOutline,
      ionCalendarClearOutline,
    }
  },
  computed: {
    isLoggedIn() {
      return authService.isLoggedIn()
    },
    isManager() {
      return userStore.isManager()
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
      authService.logout()
      void this.$router.push('/')
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/_globals.scss';

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

.paragraph-icon {
  font-size: 0.9rem;
}


</style>
