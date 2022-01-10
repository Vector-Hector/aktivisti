<template>
  <div class="col">
    <QList v-if="userPermissions">
      <QItem
        class="manage-users-list-item"
        v-for="user in userPermissions"
        :key="user.username"
      >
        <QItemSection>
          <QItemLabel>
            <b>{{ user.username }}</b>
          </QItemLabel>
        </QItemSection>
        <QItemSection side>
          <div
            class="invitation-item-actions"
          >
            <QSelect
              class="permission-dropdown"
              :dropdownIcon="ionChevronDown"
              filled
              :model-value="user.permission_codename"
              @update:model-value="(permission) => updateObjectPermission(permission, user)"
              :options="permissionTypeConditionalOptions"
              :option-disable="(opt) => isPermissionAssignable(opt, user)"
              option-value="key"
              map-options
            >
            </QSelect>
          </div>
        </QItemSection>
      </QItem>
    </QList>
  </div>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { ContentTypeOption, ExtendedPermissionTypeOption } from 'pages/ManageUsers.vue'
import { QItem, QItemLabel, QItemSection, QList, QSelect } from 'quasar'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import { PermissionCodename, UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'

interface UserPermissionItem {
  username: string
  object_permission_id?: number
  permission_codename?: string
  permission_name?: string
}

export default defineComponent({
  name: 'UserPermissionList',
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
     * The ID of an object that has the type of the ContentType with the id `contentTypeID`.
     */
    objectId: {
      type: Number,
      required: true
    },
    /**
     * Permissions I'm able to mange for the contentType and the associated `objectId`.
     */
    myPermissionForSelectedSubAssociation: {
      type: Object as PropType<UserObjectPermissionDto>,
      required: true
    }
  },
  components: {
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QSelect
  },
  data() {
    return {
      ionChevronDown,
      userPermissions: null as UserPermissionItem[] | null
    }
  },
  async created() {
    await this.getUsersWithPermissionsForEntity()
  },
  watch: {
    contentType: async function() {
      await this.getUsersWithPermissionsForEntity()
    },
    objectId: async function() {
      await this.getUsersWithPermissionsForEntity()
    }
  },
  methods: {
    async getUsersWithPermissionsForEntity() {
      let query
      switch (this.contentType.natural_key) {
        case ContentTypeNaturalKey.SUB_ASSOCIATION:
          query = {sub_association: this.objectId.toString()}
          break
        case ContentTypeNaturalKey.STATE_ASSOCIATION:
          query = {association: this.objectId.toString()}
          break
        default:
          break
      }
      const userObjectPermissions: UserObjectPermissionDto[] = (await this.$apiClient.userPermissions.list(query)).payload.data
      this.userPermissions = userObjectPermissions.map(
        (permission) => {
          return {
            username: permission.user,
            permission_codename: permission.permission_codename,
            object_permission_id: permission.id
          }
        }
      )
    },
    isPermissionAssignable(permission: {key: string, label: string, inactive: boolean}, user: UserPermissionItem) {
      return Object(permission) === permission ? permission.inactive
        || (user.permission_codename === PermissionCodename.MANAGE_EVENTS &&
          this.myPermissionForSelectedSubAssociation?.permission_codename === PermissionCodename.TEAM_CAPTAIN)
        : true
    },
    async updateObjectPermission(permission: ExtendedPermissionTypeOption, user: UserPermissionItem) {
      if (user.object_permission_id && permission.key === PermissionCodename.NONE) {
        await this.$apiClient.userPermissions.delete(user.object_permission_id.toString())
        this.userPermissions = this.userPermissions!.filter(({username}) => username !== user.username)
        this.$q.notify({
          color: 'positive',
          message: 'Der Benutzer*in wurden die Rechte für das Verwaltungsgebiet entzogen'
        })
      } else {
        const newUserObjectPermission = {
          user: user.username,
          content_type: this.contentType.id,
          object_pk: this.objectId.toString(),
          permission_codename: permission.key
        }

        //update existing UserObjectPermission
        if (user.object_permission_id) {
          await this.$apiClient.userPermissions.patch(user.object_permission_id.toString(), newUserObjectPermission)
        }
        //or create a new one
        else {
          await this.$apiClient.userPermissions.create(newUserObjectPermission)
        }
        this.$q.notify({
          color: 'positive',
          message: 'Gespeichert'
        })
      }
      user.permission_name = permission.label
      user.permission_codename = permission.key
    }
  },
  computed: {}
})
</script>

<style lang="scss" scoped>
.manage-users-list-item {
  padding: 8px 0;
}

.permission-dropdown {
  min-width: 10rem;
}
</style>
