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
            hide-selected
            fill-input
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
              hide-selected
              fill-input
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
import { QSelect, QPage, QItem, QList, QItemSection, QItemLabel } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { userStore} from 'src/store/UserStore'
import { UserObjectPermissionDto, permissionTypeOptions, PermissionCodename } from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'


interface UserPermissionItem {
  id: number
  username: string
  object_permission_id?: number
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
      selectedUser: {id: 0, username: ''} as UserPermissionItem,
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
        (option) => Object.assign(option, {inactive: !this.allowedToManagePermissions(option)})
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
    userLabel(item: UserPermissionItem) {
      return `${item.username}`
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
      if (!this.userList.find( ({id}) => id === user.id )) {
        user.permission_codename = PermissionCodename.NONE
        user.permission_name = 'Mitglied'
        this.userList.unshift(user)
      }
      this.selectedUser = user
    },
    async selectSubAssociation(subAssociation: {id: number, name: string}) {
      this.selectedSubAssociation = subAssociation
      await this.getUsersWithPermissionsForSubAssociation(subAssociation)
    },
    async getUsersWithPermissionsForSubAssociation(subAssociation: {id: number, name: string}) {
      const userObjectPermissions: UserObjectPermissionDto[] = (await this.$apiClient.userPermissions.list({sub_association: subAssociation.id.toString()})).payload.data
      const userIds: number[] = userObjectPermissions.map((permission) => permission.user)
      const userPublicProfiles: UserPermissionItem[] = (await this.$apiClient.publicProfiles.list()).payload.data
      const relevantUserPublicProfiles = userPublicProfiles.filter((profile) => userIds.indexOf(profile.id) >= 0)
      this.myPermissionForSelectedSubAssociation = this.userManagementPermissions.filter(
        (permission) => permission.object_pk === this.selectedSubAssociation.id.toString()
      )[0]
      this.userList = userObjectPermissions.map(
        (permission) => {
          return {
            id: permission.user,
            username: relevantUserPublicProfiles.filter(
              (publicProfile) => publicProfile.id === permission.user
            )[0].username,
            object_permission_id: permission.id,
            permission_codename: permission.permission_codename,
            permission_name: permission.permission_name
          }
        }
      )
      //TODO how do global permissions fall into all this?
    },
    async updateUserObjectPermissions(permission: { key: string, label: string }, user: UserPermissionItem) {
      if (user.object_permission_id && permission.key === PermissionCodename.NONE) {
        await this.$apiClient.userPermissions.delete(user.object_permission_id.toString())
      }
      else {
        const newUserObjectPermissions = {
          user: user.id,
          object_pk : this.selectedSubAssociation.id.toString(),
          content_type : 13, //13 === subassociation
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
    },
    allowedToManagePermissions(permissionType: { key: string, label: string }) {
      const myPermissionsForSubassociation = this.userManagementPermissions.filter(
        (permission) => permission.object_pk === this.selectedSubAssociation.id.toString()
      )
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

</style>
