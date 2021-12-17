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
      :option-disable="(opt) => Object(opt) === opt ? opt.inactive : true"
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
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { ContentTypeOption, ExtendedPermissionTypeOption } from 'pages/ManageUsers.vue'
import { QBtn, QInput, QSelect } from 'quasar'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import { ErrorBus, USER_NOT_FOUND } from 'src/utils/errorBus'

export default defineComponent({
  name: 'UserPermissionAdding',
  props: {
    /**
     * Permission that could be assigned to user.
     */
    permissionTypeConditionalOptions: {
      type: Object as PropType<ExtendedPermissionTypeOption[]>,
      required: true
    },
    /**
     * The content_type for which the list should be generated.
     * see `api/v1/content-types/`
     */
    contentType: {
      type: Object as PropType<ContentTypeOption>,
      required: true
    },
    /**
     * The ID of an object that has the type of the ContentType `contentType`.
     */
    objectId: {
      type: Number,
      required: true
    }
  },
  components: {
    QBtn,
    QInput,
    QSelect
  },
  data() {
    return {
      ionChevronDown,
      username: '' as string,
      selectedPermissionType: this.permissionTypeConditionalOptions.find(({inactive}) => !inactive)
    }
  },
  emit: ['submit'],
  methods: {
    async handleSubmission() {
      const newUserObjectPermissions = {
        user: this.username,
        object_pk: this.objectId.toString(),
        content_type: this.contentType.id,
        permission_codename: this.selectedPermissionType?.key
      }
      try {
        await this.$apiClient.userPermissions.create(newUserObjectPermissions)
        this.$emit('submit')
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response) {
          const {status, data} = e.response
          if (status === 409) {
            this.$q.notify({
              color: 'info',
              message: 'Die Benutzer*in wurde bereits zur Liste hinzugefügt'
            })
          } else if (status === 400 && data.user) {
            ErrorBus.emit(USER_NOT_FOUND, 'Benutzer*in nicht gefunden.')
          }
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Beim Hinzufügen der Benutzer*in ist ein unbekannter Fehler aufgetreten'
          })
        }
      }
    }
  }

})
</script>
<Style lang="scss" scoped>

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
</Style>
