<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  ContentTypeOption,
  ExtendedPermissionTypeOption
} from 'pages/ManageUsers.vue'
import {
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QSelect,
  useQuasar
} from 'quasar'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import {
  PermissionCodename,
  UserObjectPermissionDto
} from 'src/api/model/UserObjectPermissionDto'
import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

interface UserPermissionItem {
  username: string
  object_permission_id?: number
  permission_codename?: PermissionCodename
  permission_name?: string
}

interface Props {
  // Permission that could be assigned to user.
  permissionTypeConditionalOptions: ExtendedPermissionTypeOption[]
  // The content_type for which the list should be generated. See `api/v1/content-types/`
  contentType: ContentTypeOption
  // The ID of an object that has the type of the ContentType with the id `contentTypeID`.
  objectId: number
  // Permissions I'm able to mange for the contentType and the associated `objectId`.
  myPermissionForSelectedSubAssociation: UserObjectPermissionDto
}

const props = defineProps<Props>()

defineExpose({
  getUsersWithPermissionsForEntity
})

const $q = useQuasar()
const { t } = useI18n()

const userPermissions = ref<UserPermissionItem[]>([])

onMounted(async () => {
  await getUsersWithPermissionsForEntity()
})

watch(
  () => props.contentType,
  async function () {
    await getUsersWithPermissionsForEntity()
  }
)
watch(
  () => props.objectId,
  async function () {
    await getUsersWithPermissionsForEntity()
  }
)

async function getUsersWithPermissionsForEntity() {
  let query
  switch (props.contentType.natural_key) {
    case ContentTypeNaturalKey.SUB_ASSOCIATION:
      query = { sub_association: props.objectId.toString() }
      break
    case ContentTypeNaturalKey.STATE_ASSOCIATION:
      query = { association: props.objectId.toString() }
      break
    default:
      break
  }
  const userObjectPermissions: UserObjectPermissionDto[] = (
    await apiClient.userPermissions.list(query)
  ).payload.data
  userPermissions.value = userObjectPermissions.map((permission) => {
    return {
      username: permission.user,
      permission_codename: permission.permission_codename,
      object_permission_id: permission.id
    }
  })
}
function isPermissionAssignable(
  permission: { key: string; label: string; inactive: boolean },
  user: UserPermissionItem
) {
  return Object(permission) === permission
    ? permission.inactive ||
        (user.permission_codename === PermissionCodename.MANAGE_EVENTS &&
          props.myPermissionForSelectedSubAssociation?.permission_codename ===
            PermissionCodename.TEAM_CAPTAIN)
    : true
}
async function updateObjectPermission(
  permission: ExtendedPermissionTypeOption,
  user: UserPermissionItem
) {
  if (user.object_permission_id && permission.key === PermissionCodename.NONE) {
    await apiClient.userPermissions.delete(user.object_permission_id.toString())
    userPermissions.value = userPermissions.value.filter(
      ({ username }) => username !== user.username
    )
    $q.notify({
      color: 'positive',
      message: t('manageUsers.notifications.removePermissionsSuccess')
    })
  } else {
    const newUserObjectPermission = {
      user: user.username,
      content_type: props.contentType.id,
      object_pk: props.objectId.toString(),
      permission_codename: permission.key
    }

    //update existing UserObjectPermission
    if (user.object_permission_id) {
      await apiClient.userPermissions.patch(
        user.object_permission_id.toString(),
        newUserObjectPermission
      )
    }
    //or create a new one
    else {
      await apiClient.userPermissions.create(newUserObjectPermission)
    }
    $q.notify({
      color: 'positive',
      message: t('manageUsers.notifications.savedSuccess')
    })
  }
  user.permission_name = permission.label
  user.permission_codename = permission.key
}
</script>

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
          <div class="invitation-item-actions">
            <QSelect
              class="permission-dropdown"
              :dropdownIcon="ionChevronDown"
              filled
              :model-value="user.permission_codename"
              @update:model-value="
                (permission) => updateObjectPermission(permission, user)
              "
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

<style lang="scss" scoped>
.manage-users-list-item {
  padding: 8px 0;
}

.permission-dropdown {
  min-width: 10rem;
}
</style>
