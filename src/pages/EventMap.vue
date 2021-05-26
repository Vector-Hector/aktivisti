<template>
  <div class="page">
    <div class="map-container">
      <Map
        v-model:zoom="zoom"
        :bounding-box="bbox"
        map-style="mapbox://styles/mapbox/streets-v11"
        @update:boundingBox="setBbox($event)"
      >
        <span v-if="clusterMode">
          <ClusterLayer
            :clusters="clusters"
          />
        </span>
        <span
          v-else
        >
          <span
            v-for="event in events"
            :key="event.id"
          >
            <Marker
              :location="event.location"
            >
              <Popup>
                <div class="popup-contents">
                  <span class="popup-title">{{ event.name }}</span>
                  <span class="popup-campaign">{{ event.campaigns?.map(({name}) => name).join(',') }}</span>
                  <span class="popup-date">
                    {{ new Date(event.start_date).toLocaleString() }}
                  </span>
                  <router-link
                    class="join-link no-button-decoration"
                    :to="`/events/${event.id}`"
                  >
                    <Button class="p-button button-red join-button"> Mitmachen/Infos</Button>
                  </router-link>
                </div>
              </Popup>
            </Marker>
          </span>
        </span>
      </Map>
    </div>
    <ResizableBottomSheet
      title="Alle Aktionen"
    >
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
                clearable
                input-debounce="0"
                :options="subAssociations"
                option-value="id"
                option-label="name"
                placeholder="Alle Verbände"
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
          v-model:events="events"
          v-model:pagination="eventsPagination"
          :filter-params="filterParams"
          :campaigns="campaigns"
        />
      </div>

    </ResizableBottomSheet>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from 'src/mapbox/Map.vue'
import Marker from 'src/mapbox/Marker.vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import Popup from 'src/mapbox/Popup.vue'
import { userStore } from 'src/store/UserStore'
import Button from 'primevue/button'
import { Feature } from 'geojson'
import { ClusterDto } from 'src/api/model/ClusterDto'
import ClusterLayer from 'src/mapbox/ClusterLayer.vue'
import { isEqual } from 'lodash-es'
import { showCampaignLevel } from 'src/utils/showCampaignLevel'
import ResizableBottomSheet from 'src/components/ResizableBottomSheet.vue'
import CollapsibleFilters from 'src/components/CollapsibleFilters.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import EventList from 'src/components/EventList.vue'
import { Pagination } from 'src/api/model/APIEnvelope'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import { QSelect } from 'quasar'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'

const MAX_EVENTS = 100

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
  components: {
    EventList,
    ClusterLayer,
    CollapsibleFilters,
    ResizableBottomSheet,
    Popup,
    Map,
    Marker,
    Button,
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
      events: [] as EventDto[],
      eventsPagination: null as Pagination | null,
      campaigns: [] as CampaignDto[],
      clusters: [] as ClusterDto[],
      clusterMode: true,
      boundingBox: null as Feature | null,
      tooManyEventsWarningShowing: false,
      selectedSortOption: SortOption.START_DATE as SortOption,
      sortOptions: Object.values(SortOption),
      filteredSubAssociations: [] as SubAssociationDto[],
      SortOptionLabels,
      subAssociations: [] as SubAssociationDto[],
      zoom: 5 as number | null,
      bbox: userStore.getState().bbox,
      ionChevronDown,
      ionClose,
    }
  },
  computed: {
    activatedFilterCount(): number {
      let active = 0
      if (this.filteredSubAssociations.length > 0) {
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
    boundingBoxJson() {
      return userStore.getState().bbox ? bboxPolygon(userStore.getState().bbox!).geometry : null
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
        sub_association: this.filteredSubAssociations.length > 0 ? this.filteredSubAssociations.map(({id}) => id) : undefined,
        campaigns: this.filteredCampaign && this.filteredCampaign.id > 0 ? [this.filteredCampaign.id] : undefined,
        within: this.boundingBoxJson ? JSON.stringify(this.boundingBoxJson) : undefined,
        order_by: this.selectedSortOption,
        limit: MAX_EVENTS
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
    setBbox(value: BBox2d) {
      userStore.setBbox(value)
    },
    async getSubAssociations() {
      this.subAssociations = (await this.$apiClient.subAssociations.list()).payload.data
    },
    async updateView() {
      const clusterResponse = await this.$apiClient.eventClusters.list(this.filterParams)
      if (isEqual(this.clusters, clusterResponse.payload.data)) {
        return
      }
      this.clusters = clusterResponse.payload.data
      const eventCount = this.clusters.reduce((acc, item) => acc + item.count, 0)
      // show events if we reached zoom level > 15 or less than 100 events are on the current page
      this.clusterMode = !(eventCount <= MAX_EVENTS || this.zoom! > 15)
      const eventsResponse = await this.$apiClient.events.list(this.filterParams)
      this.events = eventsResponse.payload.data
      this.eventsPagination = eventsResponse.payload.pagination!

      // If the amount of events is still more than MAX_EVENTS show a warning that not all events are shown
      if (!this.clusterMode && eventCount > MAX_EVENTS && !this.tooManyEventsWarningShowing) {
        this.$q.notify({
          multiLine: true,
          message: '<h5>Hier ist zuviel los</h5>Nicht alle Aktionen werden angezeigt, da dies zuviel für die Karte wäre. Nutze die Listenansicht',
          html: true,
          group: 'too-many-events-alert'
        })
      }
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    }
  }
})
</script>

<style lang="scss" scoped>
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-campaign {
  display: block;
  font-size: 0.9rem;
}

.popup-date {
  display: block;
  font-size: 0.9rem;
}

.map {
  width: auto;
}

.join-link {
  align-self: flex-end;

  Button {
    padding: 3px 6px;
  }

  margin-top: 6px;
}

.popup-contents {
  display: flex;
  flex-direction: column;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  flex: 1;
  display: flex;
}

.filter-content {
  padding: 1rem;
}

.collapsible-filters {
  margin: 1.5rem 0 0 0;
}

::v-deep(.small-label) {
  font-weight: bold;
  margin: 0 0 0.6rem 0;
  display: flex;
}

.select-wrapper {
  &:not(:last-of-type) {
    margin: 0 0 1rem 0;
  }
}
</style>
