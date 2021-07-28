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
            @update:model-value="selectedSubAssociation=$event"
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
            v-show="selectedSubAssociation"
          >
            <QSelect
              class="w-100 d-flex flex-col"
              placeholder="Benutzer:in suchen"
              use-input
              :model-value="selectedUsers"
              :multiple="true"
              :option-label="userLabel"
              :options="suggestedUsers"
              @filter="searchUsers"
              @add="selectUser($event.value)"
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
                <QList v-show="managedUsers.length > 0">
                  <QItem
                    v-for="user in managedUsers"
                    :key="user.id"
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
                        <QIcon
                          fill="none"
                          @click="deleteParticipation(participation.id)"
                        >
                          <QIcon
                            :name="ionClose"
                            aria-label="Nutzer von der Aktion entfernen"
                          />
                        </QIcon>
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
import { QSelect, QPage, QItem, QList, QItemSection, QItemLabel, QIcon } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { userStore} from 'src/store/UserStore'
import { UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'
import PageLoadingSpinner from 'components/PageLoadingSpinner.vue'


interface UserSuggestionItem {
  id: number
  username: string
  email?: string
}

export default defineComponent({
  name: 'ManageSubAssociations',
  components: {
    PageLoadingSpinner,
    QSelect,
    QPage,
    QItem,
    QList,
    QIcon,
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
      selectedSubAssociation: '',
      //TODO check whether this needs to be a list
      selectedUsers: [],
      suggestedUsers: [] as UserSuggestionItem[],
      managedUsers: [] as UserSuggestionItem[],
      loading: true
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
      let suggestions: UserSuggestionItem[]
      if (query) {
        suggestions = (await this.$apiClient.publicProfiles.list({query: query})).payload.data
      } else {
        suggestions = []
      }
      update(() => {
        this.suggestedUsers = suggestions
      })
    },
    selectUser(user: UserSuggestionItem) {
      console.log('selectUser triggered!')
      if (!this.managedUsers.find( ({id}) => id === user.id )) {
        this.managedUsers.unshift(user)
      }
      console.log('managedUsers: ', this.managedUsers)
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
