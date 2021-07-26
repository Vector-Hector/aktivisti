<template>
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QSelect } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { userStore} from 'src/store/UserStore'
import { UserObjectPermissionDto } from 'src/api/model/UserObjectPermissionDto'


export default defineComponent({
  name: 'ManageSubAssociations',
  components: {
    QSelect
  },
  data() {
    return {
      ionChevronDown,
      ionClose,
      allSubAssociations: [] as SubAssociationDto[],
      mySubAssociations: [] as SubAssociationDto[],
      suggestedSubAssociations: [] as SubAssociationDto[],
      selectedSubAssociation: ''
    }
  },
  async created() {
    await this.getSubAssociations()
  },
  methods: {
    async getSubAssociations() {
      this.allSubAssociations = (await this.$apiClient.subAssociations.list()).payload.data
    },
    filterSubAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedSubAssociations = this.allSubAssociations
        })
        return
      }
      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedSubAssociations = this.allSubAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
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
