<template>
  <QPage class="flex-fill">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div v-else class="manage-users-content">
        <QSelect
          label="Auf welcher Ebene möchtest du Benutzer:innen verwalten"
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
            @filter="filterSubAssociations"
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
            <div class="row">
              <div class="col-grow">
                <QInput
                  class="w-100 d-flex flex-col"
                  placeholder="Benutzer:in suchen"
                  use-input
                  v-model="newUser.username"
                  @keydown.enter="addUser"
                />
              </div>
              <QSelect
                class=""
                :dropdownIcon="ionChevronDown"
                filled
                v-model="newUserPermission"
                :options="permissionTypeOptionsForMyPermissions"
                :option-disable="opt =>
                            Object(opt) === opt ? opt.inactive === true : true"
                option-value="key"
                map-options
              >
              </QSelect>
              <div class="col-auto">
                <QBtn
                  label="Hinzufügen"
                  @click="addUser"
                />
              </div>
            </div>
            <div class="row">
              <div class="col">
                <QList v-show="userList.length > 0">
                  <QItem
                    v-for="user in userList"
                    :key="user.user"
                  >
                    <QItemSection>
                      <QItemLabel>
                        <b>{{ user.username}}</b> {{ user.email }}
                      </QItemLabel>
                    </QItemSection>

                    <QItemSection side>
                      <div
                        class="invitation-item-actions"
                      >
                        <QSelect
                          class=""
                          :dropdownIcon="ionChevronDown"
                          filled
                          :model-value="user.permission_codename"
                          @update:model-value="(permission) => updateUserObjectPermissions(permission, user)"
                          :options="permissionTypeOptionsForMyPermissions"
                          :option-disable="opt =>
                            Object(opt) === opt ? opt.inactive === true
                            || (user.permission_codename === PermissionCodename.MANAGE_EVENTS &&
                                myPermissionForSelectedSubAssociation.permission_codename === PermissionCodename.TEAM_CAPTAIN)
                             : true"
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

enum ContentTypes {
  SUB_ASSOCIATION = 'Kreisverband',
  STATE_ASSOCIATION = 'Landesverband',
  CAMPAIGN = 'Kampagne'
}

const contentTypeCodes: { key: string, code: number}[] = [{
  key: ContentTypes.SUB_ASSOCIATION,
  code: 13
}, {
  key: ContentTypes.STATE_ASSOCIATION,
  code: 12
}, {
  key: ContentTypes.CAMPAIGN,
  code: 1
}]

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
      myStateAssociations: [] as StateAssociationDto[],
      suggestedSubAssociations: [] as SubAssociationDto[],
      suggestedEntities: [] as SubAssociationDto[],
      selectedSubAssociation: {id: 0, name: ''},
      selectedEntityToManage: {id: 0, name:''},
      managementLevel: '',
      myPermissionForSelectedSubAssociation: {},
      selectedUser: {username: ''} as UserPermissionItem,
      newUser: {username: ''} as UserPermissionItem,
      newUserPermission: {key: '', label: ''},
      userList: [] as UserPermissionItem[],
      loading: true,
      permissionTypeOptions,
      PermissionCodename,
      managementLevelOptions: ['Kreisverband', 'Landesverband', 'Kampagne']
    }
  },
  async created() {
    this.allSubAssociations = await this.getSubAssociations()
    this.allStateAssociations = await this.getStateAssociations()

    await this.computeMySubAssociations()
    this.computeMyStateAssociations()
    this.loading = false
  },
  computed: {
    userManagementPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyTeamCaptainOrCoordinatorPermissions()
    },
    isUserAdminOrGlobalCoordinator(): boolean {
      return userStore.isAdminOrGlobalCoordinator()
    },
    getPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyPermissions()
    },
    permissionTypeOptionsForMyPermissions(): {key: string, label: string, inactive: boolean}[] {
      if (this.managementLevel !== 'Kreisverband') {
        return permissionTypeOptions
          .filter((option) => option.key !== PermissionCodename.TEAM_CAPTAIN)
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
    computeMyStateAssociations() {
      if (this.isUserAdminOrGlobalCoordinator) {
        this.myStateAssociations = this.allStateAssociations
      }
      else {
        this.myStateAssociations = this.getPermissions
          .filter((permission) => permission.content_type_name === 'State association')
          .map((permission) => {
            return {
              id: parseInt(permission.object_pk),
              name: permission.content_object_name
            }
          })
      }
    },
    async computeMySubAssociations() {
      if (this.isUserAdminOrGlobalCoordinator) {
        this.mySubAssociations = this.allSubAssociations
      }
      else {
        //Sub association I have direct permissions for
        const mySubAssociationsIds = this.getPermissions
          .filter((permission) => permission.content_type_name === 'Sub association')
          .map((permission) => permission.object_pk)
        this.mySubAssociations = this.allSubAssociations.filter(
          ({id}) => mySubAssociationsIds.indexOf(id.toString()) >= 0
        )
        // take care of corresponding subassociations if I have state association permission
        this.myStateAssociationIds = this.getPermissions
          .filter((permission) => permission.content_type_name === 'State association')
          .map((permission) => permission.object_pk)
        const subAssociationsInMyStateAssociations = [] as SubAssociationDto[]
        for (const stateAssociationId of this.myStateAssociationIds) {
          const newSubAssociations = await this.getSubAssociations(parseInt(stateAssociationId))
          subAssociationsInMyStateAssociations.push(...newSubAssociations)
        }
        for (const subAssociation of subAssociationsInMyStateAssociations) {
          if (mySubAssociationsIds.indexOf(subAssociation.id.toString()) < 0) {
            this.mySubAssociations.push(subAssociation)
          }
        }
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
        this.suggestedSubAssociations = this.mySubAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
    userLabel(item: UserPermissionItem) {
      return `${item.username}`
    },
    async addUser() {
      if (!this.userList.find( (user) => user.username === this.newUser.username )) {
        const newUserForList = {
          username : this.newUser.username,
          permission_codename: this.newUserPermission.key,
          permission_name: this.newUserPermission.label
        }
        try {
          await this.updateUserObjectPermissions({key: this.newUserPermission.key, label: this.newUserPermission.label}, this.newUser)
          this.userList.unshift(newUserForList)
          this.newUser =  {username: ''}
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
        case 'Kampagne':
          console.log('lala') //TODO fix campaigns!
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
        case ContentTypes.SUB_ASSOCIATION:
          query = { sub_association: entity.id.toString() }
          break;
        case ContentTypes.STATE_ASSOCIATION:
          query = { association: entity.id.toString() }
          break;
        case ContentTypes.CAMPAIGN:
          query = { campaign: entity.id.toString() }
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
    async updateUserObjectPermissions(permission: { key: string, label: string }, user: UserPermissionItem) {
      if (user.object_permission_id && permission.key === PermissionCodename.NONE) {
        await this.$apiClient.userPermissions.delete(user.object_permission_id.toString())
      }
      else {
        const newUserObjectPermissions = {
          user: user.username,
          object_pk : this.selectedEntityToManage.id.toString(),
          content_type : contentTypeCodes.find((contentType) => contentType.key === this.managementLevel)?.code,
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
      const myPermissionsForSubassociation = this.userManagementPermissions.filter(
        (permission) => permission.object_pk === this.selectedSubAssociation.id.toString()
      )
      // if I don't have permissions for the subassociation I'm state association or global coordinator,
      // so I'm allowed to manage everything
      if (myPermissionsForSubassociation.length === 0) {
        return true
      }
      if (myPermissionsForSubassociation[0].permission_codename === PermissionCodename.MANAGE_EVENTS) {
        return true
      }
      else if (myPermissionsForSubassociation[0].permission_codename === PermissionCodename.TEAM_CAPTAIN
        && (permissionType.key === PermissionCodename.TEAM_CAPTAIN || permissionType.key === PermissionCodename.NONE)) {
        //and only for users who are not coordinators!
        return true
      }
      else {
        return false
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
</style>
