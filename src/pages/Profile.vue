<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setEmailNotificationSettings(
    value: Partial<EmailNotificationSettingsDto>
  ): void
  setPermissions(value: UserObjectPermissionDto[]): void
}
export default {
  beforeRouteEnter: async (to, from, next) => {
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
      const instance = vm as IInstance
      if (initialEmailNotificationSettings) {
        instance.setEmailNotificationSettings(initialEmailNotificationSettings)
      }
      instance.setPermissions(userPermissions)
    })
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, computed, ref } from 'vue'
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
  QVueGlobals,
  useQuasar
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = getAuthStore()
const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()

const hasAtLeastOneManagePermission = computed(() => {
  return userStore.hasAtLeastOneManagePermission()
})
const hasAnyPermission = computed(() => {
  return (
    permissions.value.length > 0 ||
    user.value?.is_superuser === true ||
    user.value?.roles?.includes(CAMPAIGN_ADMIN) === true
  )
})
const realName = computed(() => {
  if (user.value === null) {
    return null
  }
  if (user.value.first_name !== null && user.value.last_name === null) {
    return `${user.value.first_name}`
  } else if (user.value.last_name !== null && user.value.first_name === null) {
    return `${user.value.last_name}`
  } else if (user.value.first_name !== null && user.value.last_name !== null) {
    return `${user.value.first_name} ${user.value.last_name}`
  } else {
    return null
  }
})
const user = computed({
  get() {
    return userStore.getState().user
  },
  set(value: UserDto | null) {
    userStore.setUser(value!)
  }
})
const homeAssociation = computed({
  get() {
    return userStore.getState().homeAssociation
  },
  set(value: SubAssociationDto | null) {
    userStore.setHomeAssociation(value)
  }
})
const homeAssociationName = computed(() => {
  return homeAssociation.value?.name
})

const profileSaveDebouncer = new SettleDebouncer()
const emailNotificationSettingsSaveDebouncer = new SettleDebouncer()
const localUser = ref(cloneDeep(userStore.getState().user))
const errors = ref<any>({})
const emailNotificationSettings = ref<Partial<EmailNotificationSettingsDto>>({
  on_invitation: true,
  on_new_volunteers: true
})
const pushNotificationSettings = ref({
  pushNotifications: userStore.state.pushNotifications
})
const permissions = ref<UserObjectPermissionDto[]>([])

function saveEmailNotificationSettingsDebounced() {
  void emailNotificationSettingsSaveDebouncer.executeDebounced(() => {
    return saveEmailNotificationSettings()
  })
}
async function savePushNotificationSettings() {
  const newValue = !pushNotificationSettings.value.pushNotifications

  const action = newValue === true ? registerDevice : deregisterDevice

  const notification = notifySavingInProgress()
  try {
    await action()
    notifySuccess(notification, t('profile.notification.save.success'))

    userStore.setPushNotificationPreferences(newValue)
    pushNotificationSettings.value.pushNotifications = newValue
  } catch (e) {
    notifyFailure(notification, t('profile.notification.save.error'))
    pushNotificationSettings.value.pushNotifications = !newValue
  }
}
function saveProfileDebounced() {
  if (isEqual(user.value, localUser.value)) {
    errors.value = {}
    return
  }
  void profileSaveDebouncer.executeDebounced(() => {
    return saveProfile()
  })
}
function openChangeUsernameDialog() {
  $q.dialog({
    component: ChangeUsernameDialog
  }).onOk((new_username: string) => {
    localUser.value!.username = new_username
    user.value!.username = new_username
  })
}
function openChangeEmailDialog() {
  $q.dialog({
    component: ChangeEmailDialog
  })
}
function openChangePasswordDialog() {
  $q.dialog({
    component: ChangePasswordDialog
  })
}
async function saveEmailNotificationSettings() {
  const notification = notifySavingInProgress()

  try {
    let response
    if (!emailNotificationSettings.value?.id) {
      response = await apiClient.emailNotificationSettings.create(
        emailNotificationSettings.value
      )
    } else {
      response = await apiClient.emailNotificationSettings.update(
        emailNotificationSettings.value.id.toString(),
        {
          ...emailNotificationSettings.value,
          user: localUser.value!.id
        } as EmailNotificationSettingsDto
      )
    }
    emailNotificationSettings.value = response.payload.data
    notifySuccess(notification, t('profile.notification.save.success'))
  } catch (e) {
    if (apiClient.isApiClientError(e) || e instanceof Error) {
      notifyFailure(
        notification,
        t('profile.notification.save.errorVerbose', [e.message])
      )
    }
  }
}
async function saveProfile(): Promise<void> {
  if (user.value === null) return
  errors.value = {}
  const notification = notifySavingInProgress()
  try {
    const response = await apiClient.user.update('me', localUser.value!, [
      'sub_association'
    ])
    user.value = cloneDeep(response.payload.data)
    homeAssociation.value =
      response.payload.embedded.sub_association?.find(
        (item: SubAssociationDto) => item.id === user.value?.sub_association
      ) ?? null

    notifySuccess(notification, t('profile.notification.save.success'))
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
      notifyFailure(notification, t('profile.notification.save.errorVerify'))
    } else if (apiClient.isApiClientError(e) || e instanceof Error) {
      notifyFailure(
        notification,
        t('profile.notification.save.errorVerbose', [e.message])
      )
    }
  }
}
function openDeleteAccountPrompt() {
  $q.dialog({
    title: t('profile.deleteAccountDialog.title'),
    message: t('profile.deleteAccountDialog.description'),
    ok: t('profile.deleteAccountDialog.submitButton'),
    cancel: t('general.cancel')
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      try {
        await apiClient.user.delete('me')
        $q.notify({
          message: t('profile.deleteAccountDialog.notification.success'),
          color: 'positive'
        })
        await $router.push({ name: 'home' })
        authStore.deleteSessionData()
      } catch (e) {
        $q.notify({
          message: t('profile.deleteAccountDialog.notification.error'),
          color: 'negative'
        })
      }
    })
}
function notifySavingInProgress() {
  const notification = $q.notify({
    group: false,
    spinner: true,
    message: t('profile.notification.save.inProgress'),
    // Fixme(Peter): Should be reseted to 0, but leads to problem when
    //  requesting notification permission on android see also wk-frontend#364
    timeout: 5000
  })
  return notification
}
function notifySuccess(
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
}
function notifyFailure(
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
function setEmailNotificationSettings(
  value: Partial<EmailNotificationSettingsDto>
) {
  emailNotificationSettings.value = value
}
function setPermissions(value: UserObjectPermissionDto[]) {
  permissions.value = value
}

defineExpose({ setEmailNotificationSettings, setPermissions })
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
          :label="$t('profile.firstName')"
          @update:model-value="saveProfileDebounced"
        />
        <QInput
          stack-label
          v-model="localUser.last_name"
          :label="$t('profile.lastName')"
          @update:model-value="saveProfileDebounced"
          :error-message="errors.last_name?.[0]"
          :error="!!errors.last_name?.length"
        />
        <QInput
          stack-label
          readonly
          v-model="localUser.username"
          :label="$t('profile.username')"
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
          :label="$t('profile.email')"
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
          :label="$t('profile.password')"
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
          :label="$t('profile.phone')"
          @change="saveProfileDebounced"
          :error-message="errors.phone_number?.[0]"
          :error="!!errors.phone_number?.length"
        />
        <QInput
          stack-label
          v-model="localUser.plz"
          :label="$t('profile.zipCode')"
          @change="saveProfileDebounced"
          :error-message="errors.plz?.[0]"
          :error="!!errors.plz?.length"
        />
        <QInput
          readonly
          :label="$t('profile.subAssociation')"
          :model-value="homeAssociationName"
        />
        <h3 class="profile-section-heading">
          {{ $t('profile.notificationsSettings.title') }}
        </h3>
        <QSeparator class="profile-section-divider" />
        <QList>
          <QItem>
            <QItemSection>
              {{ $t('profile.notificationsSettings.emailOnInvitation') }}
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
              {{ $t('profile.notificationsSettings.emailOnNewVolunteers') }}
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
              {{
                $t(
                  'profile.notificationsSettings.emailOnVolounteersRequireVerfification'
                )
              }}
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
            <QItemSection>{{
              $t('profile.notificationsSettings.pushNotifications')
              }}</QItemSection>
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
          <h3 class="profile-section-heading">
            {{ $t('profile.permissions.title') }}
          </h3>
          <QSeparator class="profile-section-divider" />
          <QList>
            <QItem v-if="user?.is_superuser">
              <span
                >{{ $t('profile.permissions.youAre') }}
                <b>{{ $t('profile.permissions.administrator') }}</b></span
              >
            </QItem>
            <QItem v-if="user?.roles.includes(CAMPAIGN_ADMIN)">
              <span
                >{{ $t('profile.permissions.youAre') }}
                <b>{{ $t('profile.permissions.globalCoordinator') }}</b></span
              >
            </QItem>
            <QItem v-for="permission in permissions" :key="permission.id">
              <span>
                {{ $t('profile.permissions.youHavePermission') }}
                <b>{{
                  $t(
                    `api.model.UserObjectPermissionDto.permissionCodename.${permission.permission_codename}`
                  )
                }}</b>
                {{
                  $t('profile.permissions.permissionFor') +
                  ' ' +
                  $t(
                    `api.model.ContentTypeDto.naturalKey.${permission.content_type_natural_key}`
                  )
                }}
                <b>{{ permission.content_object_name }}</b>
              </span>
            </QItem>
          </QList>
        </template>
        <h3 class="profile-section-heading">
          {{ $t('profile.personalReport.title') }}
        </h3>
        <QSeparator class="profile-section-divider" />
        <PersonalMetrics />
        <h3 class="profile-section-heading">
          {{ $t('profile.account.title') }}
        </h3>
        <QSeparator class="profile-section-divider" />
        <QList>
          <QItem>
            <QItemSection>
              {{ $t('profile.account.description') }}</QItemSection
            >
            <QItemSection side>
              <QBtn
                flat
                @click="openDeleteAccountPrompt"
                color="negative"
                :label="$t('profile.account.deleteButton')"
              />
            </QItemSection>
          </QItem>
        </QList>
        <h3 class="profile-section-heading">
          {{ $t('profile.manageSessions.title') }}
        </h3>
        <QSeparator class="profile-section-divider" />
        <span class="description-text">
          {{ $t('profile.manageSessions.description') }}
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
