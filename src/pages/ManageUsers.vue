<template>
  <QPage class="flex-fill scrollbar">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div v-else class="manage-users-content">
        <div class="header">
          <QSelect
            label="Auf welcher Ebene möchtest du Benutzer*innen verwalten"
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
              :label="`Für welchen ${ContentTypesDisplayNames.STATE_ASSOCIATION} möchtest du Benutzer*innen verwalten`"
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
                    Kein Verband gefunden
                  </q-item-section>
                </q-item>
              </template>
            </QSelect>
            <QSelect
              v-if="isManagingSubAssociation"
              class="filter-dropdown"
              :label="`Für welchen ${ContentTypesDisplayNames.SUB_ASSOCIATION} möchtest du Benutzer*innen verwalten`"
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
                    Kein Verband gefunden
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

<script lang="ts">
import { defineComponent } from 'vue'
import { QItem, QItemSection, QPage, QSelect } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { userStore } from 'src/store/UserStore'
import {
  PermissionCodename,
  PermissionTypeOption,
  permissionTypeOptions,
  UserObjectPermissionDto
} from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'
import UserPermissionAdding from 'components/UserPermissionAdding.vue'
import UserPermissionList from 'components/UserPermissionList.vue'

enum ContentTypesDisplayNames {
  SUB_ASSOCIATION = 'Kreisverband',
  STATE_ASSOCIATION = 'Landesverband'
}

export interface ContentTypeOption {
  id: number
  label: ContentTypesDisplayNames
  natural_key: ContentTypeNaturalKey
}

export interface ExtendedPermissionTypeOption {
  key: PermissionCodename
  label: string
  inactive: boolean
}

export default defineComponent({
  name: 'ManageUsers',
  components: {
    UserPermissionList,
    UserPermissionAdding,
    PageLoadingSpinner,
    QSelect,
    QPage,
    QItem,
    QItemSection
  },
  data() {
    return {
      ContentTypesDisplayNames,
      ContentTypeNaturalKey,
      ionChevronDown,
      ionClose,
      mySubAssociations: [] as SubAssociationDto[],
      myStateAssociations: [] as StateAssociationDto[],
      suggestedSubAssociations: [] as SubAssociationDto[],
      suggestedStateAssociations: [] as StateAssociationDto[],
      loading: true,
      permissionTypeOptions,
      PermissionCodename,
      contentTypeOptions: null as ContentTypeOption[] | null,
      selectedContentType: null as ContentTypeOption | null,
      selectedState: null as StateAssociationDto | null,
      selectedSubAssociation: null as SubAssociationDto | null,
      myExplicitPermissionForSelectedSubAssociation:
        null as UserObjectPermissionDto | null,
      isAbleToManageStateAssociations: true
    }
  },
  async created() {
    this.contentTypeOptions = await this.getContentTypeCodes()

    this.mySubAssociations = await this.getMySubAssociations()
    this.myStateAssociations = await this.getMyStateAssociations()

    if (!this.isUserAdminOrGlobalCoordinator) {
      if (this.myStateAssociations.length === 0) {
        this.selectedContentType = this.contentTypeOptions!.find(
          ({ natural_key }) =>
            natural_key === ContentTypeNaturalKey.SUB_ASSOCIATION
        ) as ContentTypeOption
        this.isAbleToManageStateAssociations = false
      }
      if (this.mySubAssociations.length === 1) {
        this.selectSubAssociation(this.mySubAssociations[0])
      }
      if (this.myStateAssociations.length === 1) {
        this.selectStateAssociation(this.myStateAssociations[0])
      }
    }

    this.suggestedSubAssociations = this.mySubAssociations
    this.suggestedStateAssociations = this.myStateAssociations
    this.loading = false
  },
  computed: {
    userManagementPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyTeamCaptainOrCoordinatorPermissions()
    },
    isUserAdminOrGlobalCoordinator(): boolean {
      return userStore.isAdminOrGlobalCoordinator()
    },
    isManagingState(): boolean {
      return Boolean(
        this.selectedContentType?.natural_key ===
          ContentTypeNaturalKey.STATE_ASSOCIATION
      )
    },
    isManagingSubAssociation(): boolean {
      return Boolean(
        this.selectedContentType?.natural_key ===
          ContentTypeNaturalKey.SUB_ASSOCIATION
      )
    },
    myPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyPermissions()
    },
    permissionOptionsForNewUsers(): ExtendedPermissionTypeOption[] {
      const permissionOptionsForNewUsers = [
        permissionTypeOptions.find(
          ({ key }) => key === PermissionCodename.MANAGE_EVENTS
        ) as PermissionTypeOption
      ]
      if (this.isManagingSubAssociation) {
        permissionOptionsForNewUsers.push(
          permissionTypeOptions.find(
            ({ key }) => key === PermissionCodename.TEAM_CAPTAIN
          ) as PermissionTypeOption
        )
      }
      return permissionOptionsForNewUsers.map((option) =>
        Object.assign(option, {
          inactive: !this.isAllowedToManagePermissions(option)
        })
      )
    },
    permissionOptionsForExistingUsers(): ExtendedPermissionTypeOption[] {
      const noPermission = permissionTypeOptions.find(
        ({ key }) => key === PermissionCodename.NONE
      ) as ExtendedPermissionTypeOption
      noPermission.inactive = false
      return this.permissionOptionsForNewUsers.concat([noPermission])
    }
  },
  methods: {
    userSubmitted() {
      // @ts-ignore
      this.$refs.userPermissionList.getUsersWithPermissionsForEntity()
    },
    async getSubAssociations(stateAssociationId?: number) {
      return (
        await this.$apiClient.subAssociations.list({
          state_association: stateAssociationId
        })
      ).payload.data
    },
    async getStateAssociations() {
      return (await this.$apiClient.stateAssociations.list()).payload.data
    },
    async getContentTypeCodes(): Promise<ContentTypeOption[] | null> {
      const contentTypes = (await this.$apiClient.contentTypes.list()).payload
        .data

      let contentTypeOptions = [] as ContentTypeOption[]
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
        const label =
          natural_key === ContentTypeNaturalKey.SUB_ASSOCIATION
            ? ContentTypesDisplayNames.SUB_ASSOCIATION
            : ContentTypesDisplayNames.STATE_ASSOCIATION
        contentTypeOptions.push({
          id: contentType.id,
          label: label,
          natural_key: natural_key
        })
      }
      return contentTypeOptions
    },
    async getMySubAssociations() {
      const allSubAssociations = await this.getSubAssociations()
      if (this.isUserAdminOrGlobalCoordinator) {
        return allSubAssociations
      } else {
        //Sub association I have direct permissions for
        const mySubAssociationsIds = this.myPermissions
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
        const myStateAssociationIds = this.myPermissions
          .filter(
            (permission) =>
              permission.content_type_natural_key ===
              ContentTypeNaturalKey.STATE_ASSOCIATION
          )
          .map((permission) => permission.object_pk)
        const subAssociationsInMyStateAssociations = [] as SubAssociationDto[]
        for (const stateAssociationId of myStateAssociationIds) {
          const newSubAssociations = await this.getSubAssociations(
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
    },
    async getMyStateAssociations(): Promise<StateAssociationDto[]> {
      if (this.isUserAdminOrGlobalCoordinator) {
        return await this.getStateAssociations()
      } else {
        return this.myPermissions
          .filter(
            ({ content_type_natural_key }) =>
              content_type_natural_key ===
              ContentTypeNaturalKey.STATE_ASSOCIATION
          )
          .map(({ object_pk, content_object_name }) => {
            return {
              id: parseInt(object_pk),
              name: content_object_name
            }
          })
      }
    },
    filterSubAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedSubAssociations = this.mySubAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedSubAssociations = this.mySubAssociations.filter(
          ({ name }) => name.toLowerCase().includes(lowercasedValue)
        )
      })
    },
    filterStateAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedStateAssociations = this.myStateAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedStateAssociations = this.myStateAssociations.filter(
          ({ name }) => name.toLowerCase().includes(lowercasedValue)
        )
      })
    },
    handleContentTypeSelect(ct: ContentTypeOption) {
      this.selectedContentType = ct
    },
    selectStateAssociation(state: StateAssociationDto) {
      this.selectedState = state
    },
    selectSubAssociation(subAssociation: SubAssociationDto) {
      this.selectedSubAssociation = subAssociation
      this.myExplicitPermissionForSelectedSubAssociation =
        this.userManagementPermissions.find(
          (permission) => permission.object_pk === subAssociation.id.toString()
        ) || null
    },
    isAllowedToManagePermissions(permissionType: PermissionTypeOption) {
      if (this.isManagingSubAssociation) {
        // if I don't have direct permissions for the sub association I'm state association or global coordinator,
        // so I'm allowed to manage everything
        if (!this.myExplicitPermissionForSelectedSubAssociation) {
          return true
        }
        // if I am sub association coordinator I can manage all types of permissions
        if (
          this.myExplicitPermissionForSelectedSubAssociation
            .permission_codename === PermissionCodename.MANAGE_EVENTS
        ) {
          return true
        }
        // If I am team captain I can only manage Team captain (or None) permissions
        else if (
          this.myExplicitPermissionForSelectedSubAssociation
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
  }
})
</script>

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
