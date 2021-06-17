<template>
  <div class="container">
    <div class="user-header row">
      <div class="col-shrink col">
        <QAvatar size="6em" font-size="4rem" :icon="ionPersonCircleOutline" />
      </div>
      <div class="col p-col-align-center ">
        <div class="realname" v-if="realName">
          {{ realName }}
        </div>
        <div class="username" :class="{ 'onlyname': realName }">@{{ user?.username }}</div>
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
      v-model="localUser.email"
      label="E-Mail"
      @update:model-value="saveProfileDebounced"
    >
      <template v-slot:after>
        <QBtn
          round
          flat
          :icon="ionPencil"
          @click="openChangeEmailDialog"
        />
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
          E-Mailbenachrichtigung wenn ich zu einer Aktion eingeladen wurde
        </QItemSection>
        <QItemSection side>
          <QToggle
            @update:model-value="saveEmailNotificationSettingsDebounced"

            v-model="emailNotificationSettings.on_invitation"
            class="toggle-full-width profile-toggle-item"
          />
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection>
          E-Mailbenachrichtigung wenn sich neue Freiwillige für meine Aktion gemeldet haben
        </QItemSection>
        <QItemSection side>
          <QToggle
            @update:model-value="saveEmailNotificationSettingsDebounced"

            v-model="emailNotificationSettings.on_new_volunteers"
            class="toggle-full-width profile-toggle-item"
          />
        </QItemSection>
      </QItem>
    </QList>
    <h3 class="profile-section-heading">Berechtigungen</h3>
    <QSeparator class="profile-section-divider" />
    <QList>
      <QItem v-if="user.is_superuser"><span>Du bist <b>Administrator</b></span></QItem>
      <QItem v-if="user.roles.includes(CAMPAIGN_ADMIN)">
        <span>Du bist globaler <b>Kampagnenkoordinator</b></span></QItem>
      <QItem v-for="permission in permissions" :key="permission.id">
        <span>
          Du darfst <b>{{ permission.permission_name }}</b> in {{ permission.content_type_name }}
          <b>{{ permission.content_object_name }}</b>
        </span>
      </QItem>
    </QList>
    <h3 class="profile-section-heading">Persönliche Metriken</h3>
    <QSeparator class="profile-section-divider" />
    <QTable
      flat
      hide-pagination
      :rows="personalMetricsRows"
      :columns="personalMetricsColumns"
      row-key="name"
    />
    <h3 class="profile-section-heading">Sicherheit / Daten</h3>
    <QSeparator class="profile-section-divider" />
    <QList>
      <QItem>
        <QItemSection>
          Deinen Account löschen
        </QItemSection>
        <QItemSection side>
          <QBtn
            flat
            @click="openDeleteAccountPrompt"
            color="negative"
            label="Account löschen"
          />
        </QItemSection>
      </QItem>
      <QItem>
        <QItemSection>
          Alle Anmelde-Sessions beenden
        </QItemSection>
        <QItemSection side>
          <QBtn
            flat
            @click="deleteAllSessionsButton"
            color="negative"
            label="Sessions beenden"
          />
        </QItemSection>
      </QItem>
    </QList>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QAvatar, QBtn, QInput, QItem, QItemSection, QList, QSeparator, QTable, QToggle } from 'quasar'
import { ionCheckmark, ionClose, ionPencil, ionPersonCircleOutline } from '@quasar/extras/ionicons-v5'
import { userStore } from 'src/store/UserStore'
import { CAMPAIGN_ADMIN, UserDto } from 'src/api/model/UserDto'
import { apiClient } from 'src/api/ApiClient'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { cloneDeep, isEqual } from 'lodash-es'
import ChangeEmailDialog from 'components/modals/ChangeEmailDialog.vue'
import ChangePasswordDialog from 'components/modals/ChangePasswordDialog.vue'
import { EmailNotificationSettingsDto } from 'src/api/model/EmailNotificationSettingsDto'
import { Debouncer } from 'src/utils/Debouncer'
import { UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import { PersonalMetricsDto } from 'src/api/model/PersonalMetricsDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { authService } from 'src/api/authService'


export default defineComponent({
  name: 'Profile',
  components: {
    QAvatar,
    QInput,
    QBtn,
    QSeparator,
    QToggle,
    QList,
    QItem,
    QTable,
    QItemSection
  },
  async beforeRouteEnter(from, to, next) {
    const [userResponse, userPermissionResponse, personalMetricsResponse, metricsResponse] = await Promise.all([
      apiClient.user.get('me', ['sub_association', 'email_notification_settings']),
      apiClient.userPermissions.list(),
      apiClient.personalMetrics.list(),
      apiClient.eventMetrics.list()
    ])
    userStore.setUser(userResponse.payload.data)
    userStore.setHomeAssociation(userResponse.payload.embedded.sub_association?.[0])
    const initialEmailNotificationSettings = userResponse.payload.embedded.email_notification_settings?.[0]
    const userPermissions = userPermissionResponse.payload.data
    next((vm) => {
      if (initialEmailNotificationSettings) {
        // @ts-ignore
        vm.emailNotificationSettings = initialEmailNotificationSettings
      }
      // @ts-ignore
      vm.permissions = userPermissions
      // @ts-ignore
      vm.personalMetrics = personalMetricsResponse.payload.data
      // @ts-ignore
      vm.eventMetrics = metricsResponse.payload.data
    })
  },
  computed: {
    realName(): string | null {
      if (this.user === null) {
        return null
      }
      if (this.user.first_name !== null && this.user.last_name === null) {
        return `${this.user.first_name}`
      } else if (this.user.last_name !== null && this.user.first_name === null) {
        return `${this.user.last_name}`
      } else if (this.user.first_name !== null && this.user.last_name !== null) {
        return `${this.user.first_name} ${this.user.last_name}`
      } else {
        return null
      }
    },
    personalMetricsRows(): { name?: string, value: number }[] {
      let generalMetrics = [] as { name?: string, value: number }[]
      if (this.personalMetrics?.counts_per_metric !== undefined) {
        generalMetrics = this.personalMetrics.counts_per_metric.map(({
          count,
          metric
        }: { count: number, metric: number }) => {
          return {
            name: this.eventMetrics.find(({id}) => id === metric)?.name,
            value: count
          }
        })
      }
      return [
        ...generalMetrics,
        {
          name: 'Besuchte Adressen',
          value: this.personalMetrics.completed_addresses ?? 0
        }
      ]
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
      profileSaveDebouncer: new Debouncer(),
      emailNotificationSettingsSaveDebouncer: new Debouncer(),
      localUser: cloneDeep(userStore.getState().user),
      ionPencil,
      errors: {},
      CAMPAIGN_ADMIN,
      emailNotificationSettings: {
        on_invitation: true,
        on_new_volunteers: true
      } as Partial<EmailNotificationSettingsDto>,
      permissions: [] as UserObjectPermissionDto[],
      personalMetrics: {} as PersonalMetricsDto,
      eventMetrics: {} as EventMetricDto[],
      personalMetricsColumns: [
        {
          field: 'name',
          name: 'name',
          label: 'Metrik',
          align: 'left'
        }, {
          field: 'value',
          name: 'value',
          label: 'Anzahl'
        }
      ]
    }
  },
  methods: {
    saveEmailNotificationSettingsDebounced() {
      void this.emailNotificationSettingsSaveDebouncer.executeDebounced(() => {
        return this.saveEmailNotificationSettings()
      })
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
      const notification = this.$q.notify({
        group: false,
        spinner: true,
        message: 'Wird gespeichert',
        timeout: 0
      })
      try {
        let response
        if (!this.emailNotificationSettings?.id) {
          response = await this.$apiClient.emailNotificationSettings.create(this.emailNotificationSettings)
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
        notification({
          spinner: false,
          icon: ionCheckmark,
          message: 'Dein Einstellungen wurden gespeichert',
          color: 'positive',
          timeout: 1500
        })
      } catch (e) {
        notification({
          spinner: false,
          icon: ionClose,
          message: `Beim speichern des Profils trat ein Fehler auf: ${e.message}`,
          color: 'negative',
          timeout: 1500
        })
      }
    },
    async saveProfile(): Promise<void> {
      if (this.user === null) return
      this.errors = {}
      const notification = this.$q.notify({
        group: false,
        spinner: true,
        message: 'Wird gespeichert',
        timeout: 0
      })
      try {
        const response = await this.$apiClient.user.update('me', this.localUser!, ['sub_association'])
        this.user = cloneDeep(response.payload.data)
        this.homeAssociation = response.payload.embedded.sub_association
          ?.find((item: SubAssociationDto) => item.id === this.user?.sub_association) ?? null

        notification({
          spinner: false,
          icon: ionCheckmark,
          message: 'Dein Profil wurde gespeichert',
          color: 'positive',
          timeout: 1500
        })
      } catch (e) {
        if (e.response?.status === 400) {
          this.errors = e.response.data
          notification({
            spinner: false,
            icon: ionClose,
            message: 'Dein Profil konnte nicht gespeichert werden, bitte prüfe deine Angaben',
            color: 'negative',
            timeout: 1500
          })
        } else {
          notification({
            spinner: false,
            icon: ionClose,
            message: `Beim speichern des Profils trat ein Fehler auf: ${e.message}`,
            color: 'negative',
            timeout: 1500
          })
        }
      }
    },
    openDeleteAccountPrompt() {
      this.$q.dialog({
        title: 'Account löschen',
        message: 'Möchtest du wirklich deinen Account löschen?',
        ok: 'Account löschen',
        cancel: 'Abbrechen'
      })
        .onOk(async () => {
          try {
            await this.$apiClient.user.delete('me')
            this.$q.notify({
              message: 'Dein Account wurde gelöscht',
              color: 'positive'
            })
            await this.$router.push({name: 'splash'})
            authService.logout()
          } catch (e) {
            this.$q.notify({
              message: 'Beim löschen deines Accounts trat ein Fehler auf',
              color: 'negative'
            })
          }
        })
    },
    deleteAllSessionsButton() {
      this.$q.dialog({
        title: 'Sessions beenden',
        message: 'Möchtest du alle Sessions beenden? Damit werden alle Geräte mit denen du dich angemeldet hast ausgeloggt (auch dieses).',
        ok: 'Sessions beenden',
        cancel: 'Abbrechen'
      })
        .onOk(async () => {
          try {
            await this.$apiClient.tokens.revokeAll()
            this.$q.notify({
              message: 'Alle Anmelde-Sessions wurden beendet',
              color: 'positive'
            })
            await this.$router.push({name: 'splash'})
            authService.logout()
          } catch (e) {
            this.$q.notify({
              message: 'Beim beenden aller Anmelde-Sessions trat ein fehler auf',
              color: 'negative'
            })
          }
        })
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables";

.realname {
  font-weight: bold;
  font-size: 1.2rem;
}

.username {
  color: $gray-700;

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
