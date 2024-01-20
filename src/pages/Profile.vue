<script lang="ts">
import { defineComponent } from 'vue'
import {
  QAvatar,
  QBtn,
  QInput,
  QItem,
  QItemSection,
  QList,
  QPage,
  QScrollArea,
  QSeparator,
  QToggle,
  QVueGlobals
} from 'quasar'
import {
  ionCheckmark,
  ionClose,
  ionPencil,
  ionPersonCircleOutline
} from '@quasar/extras/ionicons-v5'
import { userStore } from 'src/store/UserStore'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { apiClient } from 'src/api/ApiClient'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { cloneDeep, isEqual } from 'lodash-es'
import ChangeEmailDialog from 'components/modals/ChangeEmailDialog.vue'
import ChangePasswordDialog from 'components/modals/ChangePasswordDialog.vue'
import { EmailNotificationSettingsDto } from 'src/api/model/EmailNotificationSettingsDto'
import { UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import { SettleDebouncer } from 'src/utils/debounce'
import { getAuthStore } from 'src/store/AuthStore'
import AppSessions from 'components/AppSessions.vue'
import ChangeUsernameDialog from 'components/modals/ChangeUsernameDialog.vue'
import PersonalMetrics from 'components/PersonalMetrics.vue'
import { deregisterDevice, registerDevice } from 'src/utils/push-notification'

const authStore = getAuthStore()

export default defineComponent({
  name: 'Profile',
  components: {
    PersonalMetrics,
    AppSessions,
    QAvatar,
    QInput,
    QBtn,
    QSeparator,
    QToggle,
    QList,
    QPage,
    QItem,
    QItemSection,
    QScrollArea
  },
  async beforeRouteEnter(from, to, next) {
    const userResponse = await apiClient.user.get('me', [
      'sub_association',
      'email_notification_settings'
    ])
    userStore.setUser(userResponse.payload.data)
    userStore.setHomeAssociation(
      userResponse.payload.embedded.sub_association?.[0]
    )

    const userPermissionResponse = await apiClient.userPermissions.list({
      user: userResponse.payload.data.id
    })
    const userPermissions = userPermissionResponse.payload.data
    const initialEmailNotificationSettings =
      userResponse.payload.embedded.email_notification_settings?.[0]
    next((vm) => {
      if (initialEmailNotificationSettings) {
        // @ts-ignore
        vm.emailNotificationSettings = initialEmailNotificationSettings
      }
      // @ts-ignore
      vm.permissions = userPermissions
    })
  },
  computed: {
    hasAtLeastOneManagePermission(): boolean {
      return userStore.hasAtLeastOneManagePermission()
    },
    hasAnyPermission(): boolean {
      return (
        this.permissions.length > 0 ||
        this.user?.is_superuser === true ||
        this.user?.roles?.includes(CAMPAIGN_ADMIN) === true
      )
    },
    realName(): string | null {
      if (this.user === null) {
        return null
      }
      if (this.user.first_name !== null && this.user.last_name === null) {
        return `${this.user.first_name}`
      } else if (
        this.user.last_name !== null &&
        this.user.first_name === null
      ) {
        return `${this.user.last_name}`
      } else if (
        this.user.first_name !== null &&
        this.user.last_name !== null
      ) {
        return `${this.user.first_name} ${this.user.last_name}`
      } else {
        return null
      }
    },
    user: {
      get(): UserDto | null {
        return userStore.getState().user
      },
      set(value: UserDto) {
        userStore.setUser(value)
      }
    },
    homeAssociation: {
      get(): SubAssociationDto | null {
        return userStore.getState().homeAssociation
      },
      set(value: SubAssociationDto) {
        userStore.setHomeAssociation(value)
      }
    },
    homeAssociationName(): string | undefined {
      return this.homeAssociation?.name
    }
  },
  data() {
    return {
      ionPersonCircleOutline,
      profileSaveDebouncer: new SettleDebouncer(),
      emailNotificationSettingsSaveDebouncer: new SettleDebouncer(),
      localUser: cloneDeep(userStore.getState().user),
      ionPencil,
      errors: {},
      CAMPAIGN_ADMIN,
      emailNotificationSettings: {
        on_invitation: true,
        on_new_volunteers: true
      } as Partial<EmailNotificationSettingsDto>,
      pushNotificationSettings: {
        pushNotifications: userStore.state.pushNotifications
      },
      permissions: [] as UserObjectPermissionDto[]
    }
  },
  methods: {
    saveEmailNotificationSettingsDebounced() {
      void this.emailNotificationSettingsSaveDebouncer.executeDebounced(() => {
        return this.saveEmailNotificationSettings()
      })
    },
    async savePushNotificationSettings() {
      const newValue = !this.pushNotificationSettings.pushNotifications

      const action = newValue === true ? registerDevice : deregisterDevice

      const notification = this.notifySavingInProgress()
      try {
        await action()
        this.notifySuccess(
          notification,
          'Deine Einstellungen wurden gespeichert'
        )

        userStore.setPushNotificationPreferences(newValue)
        this.pushNotificationSettings.pushNotifications = newValue
      } catch (e) {
        this.notifyFailure(
          notification,
          'Beim speichern des Profils trat ein Fehler auf'
        )
        this.pushNotificationSettings.pushNotifications = !newValue
      }
    },
    saveProfileDebounced() {
      if (isEqual(this.user, this.localUser)) {
        this.errors = {}
        return
      }
      void this.profileSaveDebouncer.executeDebounced(() => {
        return this.saveProfile()
      })
    },
    openChangeUsernameDialog() {
      this.$q
        .dialog({
          component: ChangeUsernameDialog
        })
        .onOk((new_username: string) => {
          this.localUser!.username = new_username
          this.user!.username = new_username
        })
    },
    openChangeEmailDialog() {
      this.$q.dialog({
        component: ChangeEmailDialog
      })
    },
    openChangePasswordDialog() {
      this.$q.dialog({
        component: ChangePasswordDialog
      })
    },
    async saveEmailNotificationSettings() {
      const notification = this.notifySavingInProgress()

      try {
        let response
        if (!this.emailNotificationSettings?.id) {
          response = await this.$apiClient.emailNotificationSettings.create(
            this.emailNotificationSettings
          )
        } else {
          response = await this.$apiClient.emailNotificationSettings.update(
            this.emailNotificationSettings.id.toString(),
            {
              ...this.emailNotificationSettings,
              user: this.localUser!.id
            } as EmailNotificationSettingsDto
          )
        }
        this.emailNotificationSettings = response.payload.data
        this.notifySuccess(
          notification,
          'Deine Einstellungen wurden gespeichert'
        )
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) || e instanceof Error) {
          this.notifyFailure(
            notification,
            `Beim speichern des Profils trat ein Fehler auf: ${e.message}`
          )
        }
      }
    },
    async saveProfile(): Promise<void> {
      if (this.user === null) return
      this.errors = {}
      const notification = this.notifySavingInProgress()
      try {
        const response = await this.$apiClient.user.update(
          'me',
          this.localUser!,
          ['sub_association']
        )
        this.user = cloneDeep(response.payload.data)
        this.homeAssociation =
          response.payload.embedded.sub_association?.find(
            (item: SubAssociationDto) => item.id === this.user?.sub_association
          ) ?? null

        this.notifySuccess(notification, 'Dein Profil wurde gespeichert')
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
          this.notifyFailure(
            notification,
            'Dein Profil konnte nicht gespeichert werden, bitte prüfe deine Angaben'
          )
        } else if (this.$apiClient.isApiClientError(e) || e instanceof Error) {
          this.notifyFailure(
            notification,
            `Beim speichern des Profils trat ein Fehler auf: ${e.message}`
          )
        }
      }
    },
    openDeleteAccountPrompt() {
      this.$q
        .dialog({
          title: 'Account löschen',
          message: 'Möchtest du wirklich deinen Account löschen?',
          ok: 'Account löschen',
          cancel: 'Abbrechen'
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .onOk(async () => {
          try {
            await this.$apiClient.user.delete('me')
            this.$q.notify({
              message: 'Dein Account wurde gelöscht',
              color: 'positive'
            })
            await this.$router.push({ name: 'splash' })
            authStore.deleteSessionData()
          } catch (e) {
            this.$q.notify({
              message: 'Beim löschen deines Accounts trat ein Fehler auf',
              color: 'negative'
            })
          }
        })
    },
    notifySavingInProgress() {
      const notification = this.$q.notify({
        group: false,
        spinner: true,
        message: 'Wird gespeichert',
        // Fixme(Peter): Should be reseted to 0, but leads to problem when
        //  requesting notification permission on android see also wk-frontend#364
        timeout: 5000
      })
      return notification
    },
    notifySuccess(
      notification: ReturnType<QVueGlobals['notify']>,
      message: string
    ) {
      notification({
        spinner: false,
        icon: ionCheckmark,
        message,
        color: 'positive',
        timeout: 1500
      })
    },
    notifyFailure(
      notification: ReturnType<QVueGlobals['notify']>,
      message: string
    ) {
      notification({
        spinner: false,
        icon: ionClose,
        message,
        color: 'negative',
        timeout: 1500
      })
    }
  }
})
</script>

<template>
  <QScrollArea class="d-flex flex-fill">
    <QPage>
      <div class="container">
        <div class="user-header row">
          <div class="col-shrink col">
            <QAvatar
              size="6em"
              font-size="4rem"
              :icon="ionPersonCircleOutline"
            />
          </div>
          <div class="col justify-center d-flex column">
            <div class="realname" v-if="realName">
              {{ realName }}
            </div>
            <div class="username" :class="{ onlyname: realName }">
              @{{ user?.username }}
            </div>
          </div>
        </div>
        <QSeparator class="profile-section-divider" />
        <QInput
          stack-label
          v-model="localUser.first_name"
          label="Vorname"
          @update:model-value="saveProfileDebounced"
        />
        <QInput
          stack-label
          v-model="localUser.last_name"
          label="Nachname"
          @update:model-value="saveProfileDebounced"
          :error-message="errors.last_name?.[0]"
          :error="!!errors.last_name?.length"
        />
        <QInput
          stack-label
          readonly
          v-model="localUser.username"
          label="Benutzer*innenname"
          @update:model-value="saveProfileDebounced"
        >
          <template v-slot:after>
            <QBtn
              round
              flat
              :icon="ionPencil"
              @click="openChangeUsernameDialog"
            />
          </template>
        </QInput>
        <QInput
          stack-label
          readonly
          v-model="localUser.email"
          label="E-Mail"
          @update:model-value="saveProfileDebounced"
        >
          <template v-slot:after>
            <QBtn round flat :icon="ionPencil" @click="openChangeEmailDialog" />
          </template>
        </QInput>
        <QInput
          stack-label
          readonly
          type="password"
          model-value="************"
          label="Passwort"
          @update:model-value="saveProfileDebounced"
        >
          <template v-slot:after>
            <QBtn
              round
              flat
              :icon="ionPencil"
              @click="openChangePasswordDialog"
            />
          </template>
        </QInput>
        <QInput
          stack-label
          v-model="localUser.phone_number"
          label="Telefon"
          @change="saveProfileDebounced"
          :error-message="errors.phone_number?.[0]"
          :error="!!errors.phone_number?.length"
        />
        <QInput
          stack-label
          v-model="localUser.plz"
          label="Postleitzahl"
          @change="saveProfileDebounced"
          :error-message="errors.plz?.[0]"
          :error="!!errors.plz?.length"
        />
        <QInput
          readonly
          label="Bezirk/Kreisverband"
          :model-value="homeAssociationName"
        />
        <h3 class="profile-section-heading">Benachrichtigungen</h3>
        <QSeparator class="profile-section-divider" />
        <QList>
          <QItem>
            <QItemSection>
              E-Mail-Benachrichtigung wenn ich zu einer Aktion eingeladen wurde
            </QItemSection>
            <QItemSection side>
              <QToggle
                @update:model-value="saveEmailNotificationSettingsDebounced"
                v-model="emailNotificationSettings.on_invitation"
                class="toggle-full-width profile-toggle-item"
              />
            </QItemSection>
          </QItem>
          <QItem v-if="hasAtLeastOneManagePermission">
            <QItemSection>
              E-Mail-Benachrichtigung wenn sich neue Freiwillige für meine
              Aktion gemeldet haben
            </QItemSection>
            <QItemSection side>
              <QToggle
                @update:model-value="saveEmailNotificationSettingsDebounced"
                v-model="emailNotificationSettings.on_new_volunteers"
                class="toggle-full-width profile-toggle-item"
              />
            </QItemSection>
          </QItem>
          <QItem v-if="hasAtLeastOneManagePermission">
            <QItemSection>
              E-Mail-Benachrichtigung wenn neue Freiwillige meine Bestätigung
              brauchen
            </QItemSection>
            <QItemSection side>
              <QToggle
                @update:model-value="saveEmailNotificationSettingsDebounced"
                v-model="
                  emailNotificationSettings.on_new_volunteers_requiring_verification
                "
                class="toggle-full-width profile-toggle-item"
              />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Push Notifications</QItemSection>
            <QItemSection side>
              <QToggle
                @update:model-value="savePushNotificationSettings"
                v-model="pushNotificationSettings.pushNotifications"
                class="toggle-full-width profile-toggle-item"
              />
            </QItemSection>
          </QItem>
        </QList>
        <template v-if="hasAnyPermission">
          <h3 class="profile-section-heading">Berechtigungen</h3>
          <QSeparator class="profile-section-divider" />
          <QList>
            <QItem v-if="user?.is_superuser">
              <span>Du bist <b>Administrator</b></span>
            </QItem>
            <QItem v-if="user?.roles.includes(CAMPAIGN_ADMIN)">
              <span>Du bist globale*r <b>Koordinator*in</b></span>
            </QItem>
            <QItem v-for="permission in permissions" :key="permission.id">
              <span>
                Du hast die Berechtigung
                <b>{{ permission.permission_name }}</b> in
                {{ permission.content_type_name }}
                <b>{{ permission.content_object_name }}</b>
              </span>
            </QItem>
          </QList>
        </template>
        <h3 class="profile-section-heading">Persönliche Ergebnisse</h3>
        <QSeparator class="profile-section-divider" />
        <PersonalMetrics />
        <h3 class="profile-section-heading">Account</h3>
        <QSeparator class="profile-section-divider" />
        <QList>
          <QItem>
            <QItemSection> Deinen Account löschen</QItemSection>
            <QItemSection side>
              <QBtn
                flat
                @click="openDeleteAccountPrompt"
                color="negative"
                label="Account löschen"
              />
            </QItemSection>
          </QItem>
        </QList>
        <h3 class="profile-section-heading">Aktive Sitzungen</h3>
        <QSeparator class="profile-section-divider" />
        <span class="description-text">
          Dies ist eine Liste der Geräte, die sich bei deinem Konto angemeldet
          haben. Widerrufe alle Sitzungen, die Du nicht kennst.
        </span>
        <AppSessions />
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
@import 'src/css/variables';

.container {
  margin-bottom: 1.5em;
}

.description-text {
  color: $grey-6;
  font-size: 0.75rem;
  padding: 1rem 2rem 1rem 0;
  line-height: 1;
  display: block;
}

.realname {
  font-weight: bold;
  font-size: 1.2rem;
}

.username {
  color: $grey-5;

  &.onlyname {
    color: $text-primary;
    font-size: 1.2rem;
  }
}

.profile-section-heading {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  line-height: 1.7rem;
}

.profile-section-divider {
  margin: 0.8em 0;
}

::v-deep(.toggle-full-width) {
  .q-toggle__label {
    flex: 1;
  }
}

.profile-toggle-item {
  margin: 0.5rem 0;
}
</style>
