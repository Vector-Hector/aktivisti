<template>
  <div class="container">
    <CollapsibleFilters
      class="collapsible-filters"
      :activated-filter-count="activatedFilterCount"
    >
      <div class="filter-content">
        <div class="select-wrapper">
          <QSelect
            :dropdownIcon="ionChevronDown"
            :clearIcon="ionClose"
            filled
            label="Kampagnen"
            v-model="filteredCampaign"
            :options="campaignOptions"
            option-value="id"
            option-label="name"
            use-chips
          />
        </div>
        <div class="select-wrapper">
          <QSelect
            class="filter-dropdown"
            label="Bezirks/Kreisverband"
            :dropdownIcon="ionChevronDown"
            :clearIcon="ionClose"
            filled
            multiple
            v-model="filteredSubAssociations"
            use-input
            use-chips
            clearable
            input-debounce="0"
            :options="suggestedSubassociations"
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
        <div class="select-wrapper">
          <QSelect
            class="filter-dropdown"
            :dropdownIcon="ionChevronDown"
            :clearIcon="ionClose"
            filled
            v-model="selectedSortOption"
            input-debounce="0"
            label="Sortierung"
            :options="sortOptions"
            :option-value="(item) => item"
            :option-label="(item) => SortOptionLabels[item]"
            placeholder="Sortierung auswählen"
          />
        </div>
      </div>
    </CollapsibleFilters>
    <EventList
      v-if="eventsPagination && events"
      v-model:events="events"
      v-model:pagination="eventsPagination"
      :filter-params="filterParams"
      :campaigns="campaigns"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { userStore } from 'src/store/UserStore'
import { Feature } from 'geojson'
import { isEqual } from 'lodash-es'
import { showCampaignLevel } from 'src/utils/showCampaignLevel'
import CollapsibleFilters from 'src/components/CollapsibleFilters.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import EventList from 'src/components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { QSelect } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import EventsOverviewMixin from 'pages/event-map/overview/EventsOverviewMixin'
import { EVENT_MAP_MAX_EVENTS } from 'src/constants'


enum SortOption {
  START_DATE = 'start_date',
  NAME = 'name'
}

const SortOptionLabels = {
  [SortOption.START_DATE]: 'Datum (Beginn)',
  [SortOption.NAME]: 'Aktionsname'
}

export default defineComponent({
  name: 'EventMap',
  mixins: [EventsOverviewMixin],
  components: {
    EventList,
    CollapsibleFilters,
    QSelect
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().bbox === null) {
      next({name: 'splash'})
    } else {
      next()
    }
  },
  data() {
    return {
      iconWidth: 25,
      iconHeight: 40,
      eventsPagination: null as Pagination | null,
      campaigns: [] as CampaignDto[],
      boundingBox: null as Feature | null,
      selectedSortOption: SortOption.START_DATE as SortOption,
      sortOptions: Object.values(SortOption),
      filteredSubAssociations: [] as SubAssociationDto[],
      SortOptionLabels,
      subAssociations: [] as SubAssociationDto[],
      suggestedSubassociations: [] as SubAssociationDto[],
      bbox: userStore.getState().bbox,
      ionChevronDown,
      ionClose
    }
  },
  computed: {
    activatedFilterCount(): number {
      let active = 0
      if (this.filteredSubAssociations?.length > 0) {
        active++
      }
      if (this.filteredCampaign) {
        active++
      }
      return active
    },
    campaignOptions(): Partial<CampaignDto>[] {
      return [
        {
          id: 0,
          name: 'Alle Kampagnen'
        },
        ...this.campaigns
      ]
    },
    filteredCampaign: {
      get(): CampaignDto | undefined {
        return this.campaigns.find(({id}) => userStore.getState().campaign === id)
      },
      set(value: Partial<CampaignDto> | undefined) {
        if (value?.id && value.id > 0) {
          userStore.setCampaign(value.id)
        } else {
          userStore.setCampaign(null)
        }
      }
    },
    filterParams(): { [key: string]: any } {
      return {
        sub_association: this.filteredSubAssociations?.length > 0 ? this.filteredSubAssociations.map(({id}) => id) : undefined,
        campaigns: this.filteredCampaign && this.filteredCampaign.id > 0 ? [this.filteredCampaign.id] : undefined,
        within: this.boundingBoxJson ? JSON.stringify(this.boundingBoxJson) : undefined,
        order_by: this.selectedSortOption,
        limit: EVENT_MAP_MAX_EVENTS
      }
    }
  },
  watch: {
    filterParams: {
      handler(newValue, oldValue) {
        if (isEqual(newValue, oldValue)) return
        void this.updateView()
      },
      deep: true,
      immediate: true
    }
  },
  async created() {
    await this.getCampaigns()
    await this.getSubAssociations()
    const userSubAssociationId = userStore.getState().user?.sub_association
    const userSubAssociation = this.subAssociations.find(({id}) => id === userSubAssociationId)
    if (
      userSubAssociation !== undefined
    ) {
      this.filteredSubAssociations = [
        ...this.filteredSubAssociations,
        userSubAssociation
      ]
    }
  },
  methods: {
    showCampaignLevel,
    filterSubAssociations(value: string, update: any) {
      if (!value) {
        update(() => {
          this.suggestedSubassociations = this.subAssociations
        })
        return
      }

      update(() => {
        const lowercasedValue = value.toLowerCase()
        this.suggestedSubassociations = this.subAssociations.filter(({name}) => name.toLowerCase().includes(lowercasedValue))
      })
    },
    async getSubAssociations() {
      this.subAssociations = (await this.$apiClient.subAssociations.list()).payload.data
    },
    async updateView() {
      const clusterResponse = await this.$apiClient.eventClusters.list(this.filterParams)
      if (!isEqual(this.clusters, clusterResponse.payload.data)) {
        this.clusters = clusterResponse.payload.data
      }
      const eventsResponse = await this.$apiClient.events.list(this.filterParams)
      if (!isEqual(this.events, eventsResponse.payload.data))
        this.events = eventsResponse.payload.data
      this.eventsPagination = eventsResponse.payload.pagination!
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    }
  }
})
</script>
<style lang="scss">

.filter-content {
  padding: 1rem;
}

.select-wrapper {
  &:not(:last-of-type) {
    margin: 0 0 1rem 0;
  }
}
</style>
