<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { QItem, QItemSection, QPage, QSelect } from 'quasar'
import { ionChevronDown } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { useUserStore } from 'src/stores/user'
import {
  PermissionCodename,
  PermissionTypeOption,
  usePermissionTypeOptions,
  UserObjectPermissionDto
} from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import {
  ContentTypeNaturalKey,
  useContentTypeLabels
} from 'src/api/model/ContentTypeDto'
import UserPermissionAdding from 'components/UserPermissionAdding.vue'
import UserPermissionList from 'components/UserPermissionList.vue'
import { apiClient } from 'src/api/ApiClient'

export interface ContentTypeOption {
  id: number
  label: string
  natural_key: ContentTypeNaturalKey
}

export interface ExtendedPermissionTypeOption {
  key: PermissionCodename
  label: string
  inactive: boolean
}

const userPermissionList = ref<InstanceType<typeof UserPermissionList> | null>(
  null
)

const mySubAssociations = ref<SubAssociationDto[]>([])
const myStateAssociations = ref<StateAssociationDto[]>([])
const suggestedSubAssociations = ref<SubAssociationDto[]>([])
const suggestedStateAssociations = ref<StateAssociationDto[]>([])
const loading = ref(true)
const contentTypeOptions = ref<ContentTypeOption[] | null>(null)
const selectedContentType = ref<ContentTypeOption | null>(null)
const selectedState = ref<StateAssociationDto | null>(null)
const selectedSubAssociation = ref<SubAssociationDto | null>(null)
const myExplicitPermissionForSelectedSubAssociation =
  ref<UserObjectPermissionDto | null>(null)
const isAbleToManageStateAssociations = ref(true)

const { getLabel } = useContentTypeLabels()
const { getPermissionTypeOption } = usePermissionTypeOptions()
const userStore = useUserStore()

const permissionTypeOptions = getPermissionTypeOption()

onMounted(async () => {
  contentTypeOptions.value = await getContentTypeCodes()
  console.log('contentTypeOptions', contentTypeOptions.value)

  mySubAssociations.value = await getMySubAssociations()
  myStateAssociations.value = await getMyStateAssociations()

  if (!isUserAdminOrGlobalCoordinator.value) {
    if (myStateAssociations.value.length === 0) {
      selectedContentType.value = contentTypeOptions.value!.find(
        ({ natural_key }) =>
          natural_key === ContentTypeNaturalKey.SUB_ASSOCIATION
      ) as ContentTypeOption
      isAbleToManageStateAssociations.value = false
    }
    if (mySubAssociations.value.length === 1) {
      selectSubAssociation(mySubAssociations.value[0])
    }
    if (myStateAssociations.value.length === 1) {
      selectStateAssociation(myStateAssociations.value[0])
    }
  }

  suggestedSubAssociations.value = mySubAssociations.value
  suggestedStateAssociations.value = myStateAssociations.value
  loading.value = false
})

const userManagementPermissions = computed(() => {
  return userStore.myTeamCaptainOrCoordinatorPermissions
})
const isUserAdminOrGlobalCoordinator = computed(() => {
  return userStore.isAdminOrGlobalCoordinator
})
const isManagingState = computed(() => {
  return Boolean(
    selectedContentType.value?.natural_key ===
      ContentTypeNaturalKey.STATE_ASSOCIATION
  )
})
const isManagingSubAssociation = computed(() => {
  return Boolean(
    selectedContentType.value?.natural_key ===
      ContentTypeNaturalKey.SUB_ASSOCIATION
  )
})
const myPermissions = computed(() => {
  return userStore.myPermissions
})
const permissionOptionsForNewUsers = computed(() => {
  const permissionOptionsForNewUsers = [
    permissionTypeOptions.find(
      ({ key }) => key === PermissionCodename.MANAGE_EVENTS
    ) as PermissionTypeOption
  ]
  if (isManagingSubAssociation.value) {
    permissionOptionsForNewUsers.push(
      permissionTypeOptions.find(
        ({ key }) => key === PermissionCodename.TEAM_CAPTAIN
      ) as PermissionTypeOption
    )
  }
  return permissionOptionsForNewUsers.map((option) =>
    Object.assign(option, {
      inactive: !isAllowedToManagePermissions(option)
    })
  )
})
const permissionOptionsForExistingUsers = computed(() => {
  const noPermission = permissionTypeOptions.find(
    ({ key }) => key === PermissionCodename.NONE
  ) as ExtendedPermissionTypeOption
  noPermission.inactive = false
  return permissionOptionsForNewUsers.value.concat([noPermission])
})

function userSubmitted() {
  userPermissionList.value?.getUsersWithPermissionsForEntity()
}
async function getSubAssociations(stateAssociationId?: number) {
  return (
    await apiClient.subAssociations.list({
      state_association: stateAssociationId
    })
  ).payload.data
}
async function getStateAssociations() {
  return (await apiClient.stateAssociations.list()).payload.data
}
async function getContentTypeCodes(): Promise<ContentTypeOption[] | null> {
  const contentTypes = (await apiClient.contentTypes.list()).payload.data

  const contentTypeOptions = [] as ContentTypeOption[]
  for (const natural_key of [
    ContentTypeNaturalKey.SUB_ASSOCIATION,
    ContentTypeNaturalKey.STATE_ASSOCIATION
  ]) {
    const contentType = contentTypes.find(
      (ct) => natural_key === ct.natural_key
    )
    if (!contentType) {
      throw Error('Natural key seams to be unknown to content-type service')
    }
    contentTypeOptions.push({
      id: contentType.id,
      label: getLabel(natural_key),
      natural_key: natural_key
    })
  }
  return contentTypeOptions
}
async function getMySubAssociations() {
  const allSubAssociations = await getSubAssociations()
  if (isUserAdminOrGlobalCoordinator.value) {
    return allSubAssociations
  } else {
    //Sub association I have direct permissions for
    const mySubAssociationsIds = myPermissions.value
      .filter(
        (permission) =>
          permission.content_type_natural_key ===
          ContentTypeNaturalKey.SUB_ASSOCIATION
      )
      .map((permission) => permission.object_pk)
    const mySubAssociations = allSubAssociations.filter(({ id }) =>
      mySubAssociationsIds.includes(id.toString())
    )
    // take care of corresponding subassociations if I have state association permission
    const myStateAssociationIds = myPermissions.value
      .filter(
        (permission) =>
          permission.content_type_natural_key ===
          ContentTypeNaturalKey.STATE_ASSOCIATION
      )
      .map((permission) => permission.object_pk)
    const subAssociationsInMyStateAssociations = [] as SubAssociationDto[]
    for (const stateAssociationId of myStateAssociationIds) {
      const newSubAssociations = await getSubAssociations(
        parseInt(stateAssociationId)
      )
      subAssociationsInMyStateAssociations.push(...newSubAssociations)
    }
    for (const subAssociation of subAssociationsInMyStateAssociations) {
      if (!mySubAssociationsIds.includes(subAssociation.id.toString())) {
        mySubAssociations.push(subAssociation)
      }
    }
    return mySubAssociations
  }
}
async function getMyStateAssociations(): Promise<StateAssociationDto[]> {
  if (isUserAdminOrGlobalCoordinator.value) {
    return await getStateAssociations()
  } else {
    return myPermissions.value
      .filter(
        ({ content_type_natural_key }) =>
          content_type_natural_key === ContentTypeNaturalKey.STATE_ASSOCIATION
      )
      .map(({ object_pk, content_object_name }) => {
        return {
          id: parseInt(object_pk),
          name: content_object_name
        }
      })
  }
}
function filterSubAssociations(value: string, update: any) {
  if (!value) {
    update(() => {
      suggestedSubAssociations.value = mySubAssociations.value
    })
    return
  }
  update(() => {
    const lowercasedValue = value.toLowerCase()
    suggestedSubAssociations.value = mySubAssociations.value.filter(
      ({ name }) => name.toLowerCase().includes(lowercasedValue)
    )
  })
}
function filterStateAssociations(value: string, update: any) {
  if (!value) {
    update(() => {
      suggestedStateAssociations.value = myStateAssociations.value
    })
    return
  }
  update(() => {
    const lowercasedValue = value.toLowerCase()
    suggestedStateAssociations.value = myStateAssociations.value.filter(
      ({ name }) => name.toLowerCase().includes(lowercasedValue)
    )
  })
}
function handleContentTypeSelect(ct: ContentTypeOption) {
  selectedContentType.value = ct
}
function selectStateAssociation(state: StateAssociationDto) {
  selectedState.value = state
}
function selectSubAssociation(subAssociation: SubAssociationDto) {
  selectedSubAssociation.value = subAssociation
  myExplicitPermissionForSelectedSubAssociation.value =
    userManagementPermissions.value.find(
      (permission) => permission.object_pk === subAssociation.id.toString()
    ) || null
}
function isAllowedToManagePermissions(permissionType: PermissionTypeOption) {
  if (isManagingSubAssociation.value) {
    // if I don't have direct permissions for the sub association I'm state association or global coordinator,
    // so I'm allowed to manage everything
    if (!myExplicitPermissionForSelectedSubAssociation.value) {
      return true
    }
    // if I am sub association coordinator I can manage all types of permissions
    if (
      myExplicitPermissionForSelectedSubAssociation.value
        .permission_codename === PermissionCodename.MANAGE_EVENTS
    ) {
      return true
    }
    // If I am team captain I can only manage Team captain (or None) permissions
    else if (
      myExplicitPermissionForSelectedSubAssociation.value
        .permission_codename === PermissionCodename.TEAM_CAPTAIN &&
      (permissionType.key === PermissionCodename.TEAM_CAPTAIN ||
        permissionType.key === PermissionCodename.NONE)
    ) {
      //and only for users who are not coordinators which is handled in the template!
      return true
    } else {
      return false
    }
  } else {
    //managementLevel === 'Landesverband'
    // If there is anything to manage at all I must have coordinator permissions for the selected state association
    return true
  }
}
</script>

<template>
  <QPage class="flex-fill scrollbar">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div v-else class="manage-users-content">
        <div class="header">
          <QSelect
            :label="$t('manageUsers.selectContentTypeLabel')"
            filled
            :dropdownIcon="ionChevronDown"
            :model-value="selectedContentType"
            @update:model-value="handleContentTypeSelect"
            map-options
            :options="contentTypeOptions"
            option-label="label"
            option-value="id"
            :disable="!isAbleToManageStateAssociations"
          />
          <div class="level-wrapper">
            <QSelect
              v-if="isManagingState"
              class="filter-dropdown"
              :label="
                $t('manageUsers.selectAssociationLabel', [
                  $t(
                    'api.model.ContentTypeDto.naturalKey.core.stateassociation'
                  )
                ])
              "
              :dropdownIcon="ionChevronDown"
              filled
              :model-value="selectedState"
              @update:model-value="selectStateAssociation"
              use-input
              map-options
              hide-selected
              fill-input
              input-debounce="0"
              :options="suggestedStateAssociations"
              @filter="filterStateAssociations"
              option-value="id"
              option-label="name"
              :disable="myStateAssociations.length === 1"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ $t('manageUsers.noAssociationFound') }}
                  </q-item-section>
                </q-item>
              </template>
            </QSelect>
            <QSelect
              v-if="isManagingSubAssociation"
              class="filter-dropdown"
              :label="
                $t('manageUsers.selectAssociationLabel', [
                  $t('api.model.ContentTypeDto.naturalKey.core.subassociation')
                ])
              "
              :dropdownIcon="ionChevronDown"
              filled
              :model-value="selectedSubAssociation"
              @update:model-value="selectSubAssociation"
              use-input
              map-options
              hide-selected
              fill-input
              input-debounce="0"
              :options="suggestedSubAssociations"
              @filter="filterSubAssociations"
              option-value="id"
              option-label="name"
              :disable="mySubAssociations.length === 1"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{ $t('manageUsers.noAssociationFound') }}
                  </q-item-section>
                </q-item>
              </template>
            </QSelect>
          </div>
          <div
            class="user-management-controls"
            v-if="
              (isManagingSubAssociation && selectedSubAssociation) ||
              (isManagingState && selectedState)
            "
          >
            <UserPermissionAdding
              :content-type="selectedContentType"
              :objectId="
                isManagingSubAssociation
                  ? selectedSubAssociation.id
                  : selectedState.id
              "
              :permission-type-conditional-options="
                permissionOptionsForNewUsers
              "
              @submit="userSubmitted"
            />
          </div>
        </div>
        <div
          class="user-management-list"
          v-if="
            (isManagingSubAssociation && selectedSubAssociation) ||
            (isManagingState && selectedState)
          "
        >
          <UserPermissionList
            ref="userPermissionList"
            :content-type="selectedContentType"
            :objectId="
              isManagingSubAssociation
                ? selectedSubAssociation.id
                : selectedState.id
            "
            :permission-type-conditional-options="
              permissionOptionsForExistingUsers
            "
            :myPermissionForSelectedSubAssociation="
              myExplicitPermissionForSelectedSubAssociation
            "
          />
        </div>
      </div>
    </div>
  </QPage>
</template>

<style lang="scss" scoped>
.scrollbar {
  overflow-y: auto;
}

.subassociations-section-heading {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  line-height: 1.7rem;
}

.manage-users-content {
  margin: 1rem 0 0 0;
}

.header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1000;
}

.level-wrapper {
  margin: 1rem 0 0 0;
}

.user-management-controls {
  margin: 1rem 0 0 0;
}
</style>
