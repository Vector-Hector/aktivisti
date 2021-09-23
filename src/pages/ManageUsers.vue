<template>
  <QPage class="flex-fill">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div v-else class="manage-users-content">
        <QSelect
          label="Auf welcher Ebene möchtest du Benutzer*innen verwalten"
          filled
          :dropdownIcon="ionChevronDown"
          :model-value="managementLevel"
          @update:model-value="selectManagementLevel"
          :options="managementLevelOptions"
        />
        <div v-show="managementLevel !== ''" class="level-wrapper">
          <QSelect
            class="filter-dropdown"
            :label="managementLevel"
            :dropdownIcon="ionChevronDown"
            filled
            :model-value="selectedEntityToManage"
            @update:model-value="selectEntityToManage"
            use-input
            map-options
            hide-selected
            fill-input
            input-debounce="0"
            :options="suggestedEntities"
            @filter="filterEntities"
            option-value="id"
            option-label="name"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Kein Verband gefunden
                </q-item-section>
              </q-item>
            </template>
          </QSelect>
          <div
            class="user-management-section"
            v-show="selectedEntityToManage.name !== ''"
          >
            <div class="row new-user-group">
              <div class="col-grow">
                <QInput
                  class="w-100 d-flex flex-col"
                  label="Benutzer*in wählen"
                  use-input
                  v-model="newUser.username"
                  @keydown.enter="addUser(selectedEntityToManage.id)"
                />
              </div>
              <QSelect
                class="new-user-select permission-dropdown"
                :dropdownIcon="ionChevronDown"
                filled
                v-model="newUserPermission"
                :options="permissionTypeOptionsForMyPermissions"
                :option-disable="(opt) =>
                            Object(opt) === opt ? opt.inactive : true"
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
                @click="addUser(selectedEntityToManage.id)"
              />
            </div>
            <div class="col">
              <QList v-show="userList.length > 0">
                <QItem
                  class="manage-users-list-item"
                  v-for="user in userList"
                  :key="user.user"
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
                        @update:model-value="(permission) => updateUserObjectPermissions(permission, user, selectedEntityToManage.id)"
                        :options="permissionTypeOptionsForMyPermissions"
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
          </div>
        </div>
      </div>
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QSelect, QPage, QItem, QList, QItemSection, QItemLabel, QInput, QBtn } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { userStore } from 'src/store/UserStore'
import { UserObjectPermissionDto, permissionTypeOptions, PermissionCodename } from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'
import { ErrorBus, USER_NOT_FOUND } from 'src/utils/errorBus'


interface UserPermissionItem {
  username: string
  object_permission_id?: number
  permission_codename?: string
  permission_name?: string
}

enum ContentTypesDisplayNames {
  SUB_ASSOCIATION = 'Kreisverband',
  STATE_ASSOCIATION = 'Landesverband'
}

export default defineComponent({
  name: 'ManageUsers',
  components: {
    PageLoadingSpinner,
    QSelect,
    QPage,
    QItem,
    QList,
    QItemSection,
    QItemLabel,
    QInput,
    QBtn
  },
  data() {
    return {
      ionChevronDown,
      ionClose,
      allSubAssociations: [] as SubAssociationDto[],
      allStateAssociations: [] as StateAssociationDto[],
      mySubAssociations: [] as SubAssociationDto[],
      myStateAssociationIds: [] as string[],
      suggestedEntities: [] as SubAssociationDto[],
      selectedSubAssociation: {id: 0, name: ''},
      selectedEntityToManage: {id: 0, name:''},
      managementLevel: '',
      myPermissionForSelectedSubAssociation: {} as UserObjectPermissionDto,
      selectedUser: {username: ''} as UserPermissionItem,
      newUser: {username: ''} as UserPermissionItem,
      newUserPermission: {key: PermissionCodename.NONE, label: 'Mitglied'},
      userList: [] as UserPermissionItem[],
      loading: true,
      permissionTypeOptions,
      PermissionCodename,
      managementLevelOptions: ['Kreisverband', 'Landesverband'],
      contentTypeCodes: [
        {
          name: 'Sub association',
          display_name: ContentTypesDisplayNames.SUB_ASSOCIATION,
          code: 0
        },
        {
          name: 'State association',
          display_name: ContentTypesDisplayNames.STATE_ASSOCIATION,
          code: 0
        }
      ],
    }
  },
  async created() {
    this.allSubAssociations = await this.getSubAssociations()
    this.allStateAssociations = await this.getStateAssociations()

    await this.computeMySubAssociations()
    await this.computeContentTypeCodes()
    this.loading = false
  },
  computed: {
    userManagementPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyTeamCaptainOrCoordinatorPermissions()
    },
    isUserAdminOrGlobalCoordinator(): boolean {
      return userStore.isAdminOrGlobalCoordinator()
    },
    myPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyPermissions()
    },
    myStateAssociations(): StateAssociationDto[] {
      if (this.isUserAdminOrGlobalCoordinator) {
        return this.allStateAssociations
      }
      else {
        return this.myPermissions
          .filter((permission) => permission.content_type_name === 'State association')
          .map((permission) => {
            return {
              id: parseInt(permission.object_pk),
              name: permission.content_object_name
            }
          })
      }
    },
    permissionTypeOptionsForMyPermissions(): {key: string, label: string, inactive: boolean}[] {
      if (this.managementLevel !== 'Kreisverband') {
       return permissionTypeOptions
          .filter((option) => option.key !== PermissionCodename.TEAM_CAPTAIN) //Team captains exist only for sub associations
          .map((option) => Object.assign(option, {inactive: !this.allowedToManagePermissions(option)}))
      }
      else {
        return permissionTypeOptions.map(
          (option) => Object.assign(option, {inactive: !this.allowedToManagePermissions(option)})
        )
      }
    }
  },
  methods: {
    async getSubAssociations(stateAssociationId?: number) {
      return (await this.$apiClient.subAssociations.list({state_association: stateAssociationId})).payload.data
    },
    async getStateAssociations() {
      return (await this.$apiClient.stateAssociations.list()).payload.data
    },
    async computeContentTypeCodes() {
      const allContentTypes = (await this.$apiClient.contentTypes.list()).payload.data
      for (const contentType of this.contentTypeCodes) {
        const apiType = allContentTypes.find((element) => element.name === contentType.name)
        contentType.code = apiType? apiType.id : 0
      }
    },
    async computeMySubAssociations() {
      if (this.isUserAdminOrGlobalCoordinator) {
        this.mySubAssociations = this.allSubAssociations
      }
      else {
        //Sub association I have direct permissions for
        const mySubAssociationsIds = this.myPermissions
          .filter((permission) => permission.content_type_name === 'Sub association')
          .map((permission) => permission.object_pk)
        this.mySubAssociations = this.allSubAssociations.filter(
          ({id}) => mySubAssociationsIds.includes(id.toString())
        )
        // take care of corresponding subassociations if I have state association permission
        this.myStateAssociationIds = this.myPermissions
          .filter((permission) => permission.content_type_name === 'State association')
          .map((permission) => permission.object_pk)
        const subAssociationsInMyStateAssociations = [] as SubAssociationDto[]
        for (const stateAssociationId of this.myStateAssociationIds) {
          const newSubAssociations = await this.getSubAssociations(parseInt(stateAssociationId))
          subAssociationsInMyStateAssociations.push(...newSubAssociations)
        }
        for (const subAssociation of subAssociationsInMyStateAssociations) {
          if (!mySubAssociationsIds.includes(subAssociation.id.toString())) {
            this.mySubAssociations.push(subAssociation)
          }
        }
      }
    },
    isPermissionAssignable(permission: {key: string, label: string, inactive: boolean}, user: UserPermissionItem) {
      console.log('this.myPermissionForSelected...: ', this.myPermissionForSelectedSubAssociation)
      return Object(permission) === permission ? permission.inactive
        || (user.permission_codename === PermissionCodename.MANAGE_EVENTS &&
          this.myPermissionForSelectedSubAssociation.permission_codename === PermissionCodename.TEAM_CAPTAIN)
        : true
    },
    filterEntities(value: string, update: any) {
      if (this.managementLevel === 'Kreisverband') {
        this.filterSubAssociations(value, update)
      }
      else {
        this.filterStateAssociations(value, update)
      }
    },
    filterSubAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedEntities = this.mySubAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedEntities = this.mySubAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
    filterStateAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedEntities = this.myStateAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedEntities = this.myStateAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
    userLabel(item: UserPermissionItem) {
      return `${item.username}`
    },
    async addUser(entityObjectID: number) {
      if (!this.userList.find( (user) => user.username === this.newUser.username )) {
        const newUserForList = {
          username : this.newUser.username,
          permission_codename: this.newUserPermission.key,
          permission_name: this.newUserPermission.label
        }
        try {
          await this.updateUserObjectPermissions({key: this.newUserPermission.key, label: this.newUserPermission.label}, this.newUser, entityObjectID)
          this.userList.unshift(newUserForList)
          this.newUser =  {username: ''}
          this.newUserPermission = {key: PermissionCodename.NONE, label: 'Mitglied'}
        }
        catch (e) {
          ErrorBus.emit(USER_NOT_FOUND, 'Benutzer:in nicht gefunden.')
        }
      }
    },
    selectUser(username: string) {
      let newUser = {} as UserPermissionItem
      if (!this.userList.find( (user) => user.username === username )) {
        newUser = {
          username: username,
          permission_codename : PermissionCodename.NONE,
          permission_name : 'Mitglied'
        }
        this.userList.unshift(newUser)
      }
      this.selectedUser = newUser
    },
    async selectEntityToManage(entity: {id: number, name: string}) {
      this.selectedEntityToManage = entity
      await this.getUsersWithPermissionsForEntity(entity)
    },
    selectManagementLevel(managementLevel: string) {
      switch (managementLevel) {
        case 'Kreisverband':
          this.suggestedEntities = this.mySubAssociations
          this.managementLevel = managementLevel
          this.selectedEntityToManage = {id: 0, name:''}
          break;
        case 'Landesverband':
          this.suggestedEntities = this.myStateAssociations
          this.managementLevel = managementLevel
          this.selectedEntityToManage = {id: 0, name:''}
          break;
        default:
          break;
      }
    },
    async getUsersWithPermissionsForEntity(entity: {id: number, name: string}) {
      let query
      switch (this.managementLevel) {
        case ContentTypesDisplayNames.SUB_ASSOCIATION:
          query = { sub_association: entity.id.toString() }
          break;
        case ContentTypesDisplayNames.STATE_ASSOCIATION:
          query = { association: entity.id.toString() }
          break;
        default:
          break;
      }
      const userObjectPermissions: UserObjectPermissionDto[] = (await this.$apiClient.userPermissions.list(query)).payload.data
      this.userList = userObjectPermissions.map(
        (permission) => {
          return {
            username: permission.user,
            object_permission_id: permission.id,
            permission_codename: permission.permission_codename,
            permission_name: permission.permission_name
          }
        }
      )
    },
    async updateUserObjectPermissions(permission: { key: string, label: string }, user: UserPermissionItem, objectID: number) {
      if (user.object_permission_id && permission.key === PermissionCodename.NONE) {
        await this.$apiClient.userPermissions.delete(user.object_permission_id.toString())
      }
      else {
        const newUserObjectPermissions = {
          user: user.username,
          object_pk : objectID.toString(),
          content_type : this.contentTypeCodes.find((contentType) => contentType.display_name === this.managementLevel)?.code,
          permission_codename : permission.key
        }

        //update existing UserObjectPermission
        if (user.object_permission_id) {
          await this.$apiClient.userPermissions.patch(user.object_permission_id.toString(), newUserObjectPermissions)
        }
        //or create a new one
        else {
          await this.$apiClient.userPermissions.create(newUserObjectPermissions)
        }
      }
      user.permission_name = permission.label
      user.permission_codename = permission.key
    },
    allowedToManagePermissions(permissionType: { key: string, label: string }) {
      if (this.managementLevel === 'Kreisverband') {
        const myPermissionsForSubassociation = this.userManagementPermissions.filter(
          (permission) => permission.object_pk === this.selectedEntityToManage.id.toString()
        )
        // if I don't have direct permissions for the sub association I'm state association or global coordinator,
        // so I'm allowed to manage everything
        if (myPermissionsForSubassociation.length === 0) {
          return true
        }
        this.myPermissionForSelectedSubAssociation = myPermissionsForSubassociation[0]
        // if I am sub association coordinator I can manage all types of permissions
        if (this.myPermissionForSelectedSubAssociation.permission_codename === PermissionCodename.MANAGE_EVENTS) {
          return true
        }
        // If I am team captain I can only manage Team captain (or None) permissions
        else if (myPermissionsForSubassociation[0].permission_codename === PermissionCodename.TEAM_CAPTAIN
          && (permissionType.key === PermissionCodename.TEAM_CAPTAIN || permissionType.key === PermissionCodename.NONE)) {
          //and only for users who are not coordinators which is handled in the template!
          return true
        }
        else {
          return false
        }
      }
      else { //managementLevel === 'Landesverband'
        // If there is anything to manage at all I must have coordinator permissions for the selected state association
        return true
      }
    }
  }
})
</script>

<style lang="scss" scoped>

.subassociations-section-heading {
  font-size: 1.3rem;
  margin: 1rem 0 0 0;
  line-height: 1.7rem;
}

.manage-users-content {
  margin: 1rem 0 0 0;
}

.level-wrapper {
  margin: 1rem 0 0 0;
}

.user-management-section {
  margin: 1rem 0 0 0;
}

.new-user-group {
  margin: 0 0 0.5rem 0;
}

.new-user-select {
  margin: 0 0 0 1rem;
}

.new-user-add-btn {
  margin: 0.5rem 0 0 0;
}

.manage-users-list-item {
  padding: 8px 0;
}

.permission-dropdown {
  min-width: 10rem;
}
</style>
