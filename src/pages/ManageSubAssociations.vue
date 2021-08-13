<template>
  <QPage class="flex-fill">
    <div class="container">
      <PageLoadingSpinner v-if="loading" />
      <div v-else class="manage-sub-associations-content">
        <h3 class="subassociations-section-heading">Kreisverbände</h3>
        <div class="select-wrapper">
          <QSelect
            class="filter-dropdown"
            label="Kreisverband"
            :dropdownIcon="ionChevronDown"
            filled
            :model-value="selectedSubAssociation"
            @update:model-value="selectSubAssociation"
            use-input
            map-options
            input-debounce="0"
            :options="suggestedSubAssociations"
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
            v-show="selectedSubAssociation.name !== ''"
          >
            <QSelect
              class="w-100 d-flex flex-col"
              placeholder="Benutzer:in suchen"
              :dropdownIcon="ionChevronDown"
              use-input
              :model-value="selectedUser"
              @update:model-value="selectUser"
              :option-label="userLabel"
              :options="suggestedUsers"
              @filter="searchUsers"
            >
              <template #item="slotProps">
                <div class="user-autocomplete-username">
                  {{ slotProps.item.username }}
                </div>
                <div class="user-autocomplete-email">
                  {{ slotProps.item.email }}
                </div>
              </template>
            </QSelect>
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
                          :model-value="user.permission_name"
                          @update:model-value="(permission) => updateUserObjectPermissions(permission, user)"
                          :options="permissionTypeOptionsForMyPermissions"
                          :option-disable="opt =>
                            Object(opt) === opt ? opt.inactive === true || user.permission_codename === PermissionCodename.MANAGE_EVENTS: true"
                          option-label="label"
                          option-value="key"
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
import { QSelect, QPage, QItem, QList, QItemSection, QItemLabel } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { userStore} from 'src/store/UserStore'
import {UserObjectPermissionDto, permissionTypeOptions, PermissionCodename} from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'


interface UserPermissionItem {
  id: number
  username: string
  permission_codename?: string
  permission_name?: string
}

export default defineComponent({
  name: 'ManageSubAssociations',
  components: {
    PageLoadingSpinner,
    QSelect,
    QPage,
    QItem,
    QList,
    QItemSection,
    QItemLabel
  },
  data() {
    return {
      ionChevronDown,
      ionClose,
      allSubAssociations: [] as SubAssociationDto[],
      mySubAssociations: [] as SubAssociationDto[],
      suggestedSubAssociations: [] as SubAssociationDto[],
      selectedSubAssociation: {id: 0, name: ''},
      myPermissionForSelectedSubAssociation: {},
      selectedUser: {} as UserPermissionItem,
      suggestedUsers: [] as UserPermissionItem[],
      userList: [] as UserPermissionItem[],
      loading: true,
      permissionTypeOptions,
      PermissionCodename
    }
  },
  async created() {
    await this.getSubAssociations()
    this.computeMySubAssociations()
    this.loading = false
  },
  computed: {
    //TODO check for global campaign:admin (or are there other global permission types)
    userManagementPermissions(): UserObjectPermissionDto[] {
      return userStore.getMyTeamCaptainOrCoordinatorPermissions()
    },
    permissionTypeOptionsForMyPermissions(): {key: string, label: string, inactive: boolean}[] {
      return permissionTypeOptions.map(
        (option) => Object.assign(option, {inactive: !this.allowedToManagePermissions(this.selectedSubAssociation, option)})
      )
    }
  },
  methods: {
    async getSubAssociations() {
      this.allSubAssociations = (await this.$apiClient.subAssociations.list()).payload.data
    },
    computeMySubAssociations() {
      const mySubAssociationsIds = this.userManagementPermissions.map((permission) => permission.object_pk)
      this.mySubAssociations = this.allSubAssociations.filter(
        ({id}) => mySubAssociationsIds.indexOf(id.toString()) >= 0
      )
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
    userLabel(item: UserSuggestionItem) {
      return `${item.username} ${item.email ?? ''}`
    },
    async searchUsers(query: string, update: any) {
      let suggestions: UserPermissionItem[]
      if (query) {
        suggestions = (await this.$apiClient.publicProfiles.list({query: query})).payload.data
      } else {
        suggestions = []
      }
      update(() => {
        this.suggestedUsers = suggestions
      })
    },
    selectUser(user: UserPermissionItem) {
      console.log('selectUser triggered!')
      if (!this.userList.find( ({id}) => id === user.id )) {
        user.permission_codename = PermissionCodename.NONE
        user.permission_name = 'Mitglied'
        this.userList.unshift(user)
      }
      console.log('managedUsers: ', this.userList)
      this.selectedUser = user
    },
    async selectSubAssociation(subAssociation: {id: number, name: string}) {
      console.log('@update triggered!')
      console.log('model value: ', subAssociation)
      this.selectedSubAssociation = subAssociation
      await this.getUsersWithPermissionsForSubAssociation(subAssociation)
    },
    async getUsersWithPermissionsForSubAssociation(subAssociation: {id: number, name: string}) {
      const userObjectPermissions: UserObjectPermissionDto[] = (await this.$apiClient.userPermissions.list({query: subAssociation.id.toString()})).payload.data
      const userIds: number[] = userObjectPermissions.map((permission) => permission.user)
      const userPublicProfiles: UserPermissionItem[] = (await this.$apiClient.publicProfiles.list()).payload.data
      const relevantUserPublicProfiles = userPublicProfiles.filter((profile) => userIds.indexOf(profile.id) >= 0)
      this.userList = userObjectPermissions.map(
        (permission) =>
          Object.assign(
            permission,
            {username:
              relevantUserPublicProfiles.filter(
                (publicProfile) => publicProfile.id === permission.user
              )[0].username}
          )
      )
      console.log('userObjectPermissions: ', userObjectPermissions)
      console.log('userIds: ', userIds)
      console.log('userPublicProfiles: ', relevantUserPublicProfiles)
      //TODO how do global permissions fall into all this?
    },
    //TODO How to deal with multiple permissions (teamcaptain AND coordinator?)
    //In theory, I can do only one, if that's the desired behavior; we have PATCH and PUT
    //TODO How to deal with demoting
    updateUserObjectPermissions(permission: { key: string, label: string }, user: UserPermissionItem) {
      console.log('newly selected permission is: ', permission)
      //TODO get old permission(s) from userObjectPermissions and if demoting DELETE
      console.log('user: ', user)
      const newUserObjectPermissions = {
        user: user.user,
        object_pk : user.object_pk,
        content_type : user.content_type,
        permission_codename : permission.key
      }
      console.log('newUserObjectPermissions: ', newUserObjectPermissions)

    },
    allowedToManagePermissions(subassociation: {id: number, name: string}, permissionType: { key: string, label: string }) {
      const myPermissionsForSubassociation = this.userManagementPermissions.filter(
        (permission) => permission.object_pk === subassociation.id.toString()
      )
      // If I have both teamcaptain and coordinator I am allowed to manage all kinds of permissions
      if (myPermissionsForSubassociation.length > 1) {
        return true
      }
      else if (myPermissionsForSubassociation[0].permission_codename === PermissionCodename.MANAGE_EVENTS) {
        console.log('userMgmtPermissions: ', this.userManagementPermissions)
        console.log('myPermissionsForSubAssociation: ', myPermissionsForSubassociation)
        return true
      }
      else if (myPermissionsForSubassociation[0].permission_codename === PermissionCodename.TEAM_CAPTAIN
        && (permissionType.key === PermissionCodename.TEAM_CAPTAIN || permissionType.key === PermissionCodename.NONE)) {
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

</style>
