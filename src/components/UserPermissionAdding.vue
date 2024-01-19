<script setup lang="ts">
import { ref } from 'vue'
import {
  ContentTypeOption,
  ExtendedPermissionTypeOption
} from 'pages/ManageUsers.vue'
import { QBtn, QInput, QSelect, useQuasar } from 'quasar'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import { ErrorBus, USER_NOT_FOUND } from 'src/utils/errorBus'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  /**
   * Permission that could be assigned to user.
   */
  permissionTypeConditionalOptions: ExtendedPermissionTypeOption[]
  /**
   * The content_type for which the list should be generated.
   * see `api/v1/content-types/`
   */
  contentType: ContentTypeOption
  /**
   * The ID of an object that has the type of the ContentType `contentType`.
   */
  objectId: number
}
const props = defineProps<Props>()

interface Emits {
  (e: 'submit'): void
}
const emit = defineEmits<Emits>()

const $q = useQuasar()

const username = ref('')
const selectedPermissionType = ref(
  props.permissionTypeConditionalOptions.find(({ inactive }) => !inactive)
)

async function handleSubmission() {
  const newUserObjectPermissions = {
    user: username.value,
    object_pk: props.objectId.toString(),
    content_type: props.contentType.id,
    permission_codename: selectedPermissionType.value?.key
  }
  try {
    await apiClient.userPermissions.create(newUserObjectPermissions)
    emit('submit')
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response) {
      const { status, data } = e.response
      if (status === 409) {
        $q.notify({
          color: 'info',
          message: 'Die Benutzer*in wurde bereits zur Liste hinzugefügt'
        })
      } else if (status === 400 && data.user) {
        ErrorBus.emit(USER_NOT_FOUND, 'Benutzer*in nicht gefunden.')
      }
    } else {
      $q.notify({
        color: 'negative',
        message:
          'Beim Hinzufügen der Benutzer*in ist ein unbekannter Fehler aufgetreten'
      })
    }
  }
}
</script>

<template>
  <div class="row new-user-group">
    <div class="col-grow">
      <QInput
        class="w-100 d-flex flex-col"
        label="Benutzer*in wählen"
        use-input
        v-model="username"
        @keydown.enter="handleSubmission"
      />
    </div>
    <QSelect
      class="new-user-select permission-dropdown"
      :dropdownIcon="ionChevronDown"
      filled
      v-model="selectedPermissionType"
      :options="permissionTypeConditionalOptions"
      :option-disable="(opt) => (Object(opt) === opt ? opt.inactive : true)"
      option-value="key"
      map-options
    >
    </QSelect>
    <QBtn
      class="new-user-add-btn full-width"
      label="Hinzufügen"
      unelevated
      outline
      :icon-right="ionChevronDown"
      @click="handleSubmission"
    />
  </div>
</template>

<style lang="scss" scoped>
.new-user-group {
  margin: 0 0 0.5rem 0;
}

.new-user-select {
  margin: 0 0 0 1rem;
}

.new-user-add-btn {
  margin: 0.5rem 0 0 0;
}

.permission-dropdown {
  min-width: 10rem;
}
</style>
