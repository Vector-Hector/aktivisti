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
            emit-value
            map-options
            option-value="id"
            option-label="name"
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
            emit-value
            map-options
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
import { SortOption, userStore } from 'src/store/UserStore'
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
      eventsPagination: null as Pagination | null,
      campaigns: [] as CampaignDto[],
      sortOptions: Object.values(SortOption),
      SortOptionLabels,
      subAssociations: [] as SubAssociationDto[],
      suggestedSubassociations: [] as SubAssociationDto[],
      bbox: userStore.getState().bbox,
      ionChevronDown,
      ionClose
    }
  },
  computed: {
    selectedSortOption: {
      get(): SortOption {
        return userStore.getState().filterPreferences.sorting
      },
      set(value: SortOption) {
        userStore.setFilterPreferences({
          ...userStore.getState().filterPreferences,
          sorting: value
        })
      }
    },
    filteredSubAssociations: {
      get(): number[] {
        return userStore.getState().filterPreferences.subAssociations
      },
      set(value: number[]) {
        userStore.setFilterPreferences({
          ...userStore.getState().filterPreferences,
          subAssociations: value
        })
      }
    },
    filteredCampaign: {
      get(): number | undefined {
        return userStore.getState().filterPreferences.campaign
      },
      set(value: number) {
        userStore.setFilterPreferences({
          ...userStore.getState().filterPreferences,
          campaign: value
        })
      }
    },
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
    filterParams(): { [key: string]: any } {
      return {
        sub_association: this.filteredSubAssociations?.length > 0 ? this.filteredSubAssociations : undefined,
        campaigns: this.filteredCampaign ? [this.filteredCampaign] : undefined,
        within: this.boundingBoxJson,
        order_by: this.selectedSortOption,
        limit: EVENT_MAP_MAX_EVENTS,
        end_date_after: new Date(),
        // TODO: jonatan@ctrl.alt.coop
        // atm it's well possible to not set an end date of an event making it indefinitely going, so we include them
        // in the query... Maybe we should rethink that (mandatory/default end date?)
        end_date_include_null: true
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
    this.suggestedSubassociations = this.subAssociations
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
