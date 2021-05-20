<template>
  <div class="page">
    <div class="map-container">
      <Map
        v-model:zoom="zoom"
        v-model:center="userLocation"
        map-style="mapbox://styles/mapbox/streets-v11"
        @update:boundingBox="boundingBox = $event"
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
      <ResizableBottomSheet
        title="Alle Aktionen"
      >
        <IonContent>
          <div class="container">
            <CollapsibleFilters
              class="collapsible-filters"
              :activated-filter-count="activatedFilterCount"
            >
              <div class="filter-content">
                <IonItem
                  class="no-background no-padding"
                >
                  <IonLabel
                    class="small-label"
                    position="stacked"
                  >
                    Kampagne
                  </IonLabel>
                  <IonSelect
                    v-model="filteredCampaign"
                    class="block-select ion-activatable ripple-parent"
                    placeholder="Alle Kampagnen"
                    title="Kampagne auswählen"
                    :selected-text="campaigns.find(campaign => filteredCampaign === campaign.id)?.name"
                  >
                    <IonRippleEffect />
                    <IonSelectOption
                      :key="0"
                      :value="0"
                    >
                      Alle Kampagnen
                    </IonSelectOption>
                    <IonSelectOption
                      v-for="campaign in campaigns"
                      :key="campaign.id"
                      :value="campaign.id"
                    >
                      {{ campaign.name }} ({{ showCampaignLevel(campaign) }})
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem
                  class="no-background no-padding"
                >
                  <IonLabel
                    class="small-label"
                    position="stacked"
                  >
                    Bezirks/Kreisverband
                  </IonLabel>
                  <IonSelect
                    v-model="filteredSubAssociations"
                    class="block-select ion-activatable ripple-parent"
                    placeholder="Alle Verbände"
                    :multiple="true"
                    :selected-text="filteredSubAssociations.find(subAssociation => filteredSubAssociations.includes(subAssociation.id))?.name"
                  >
                    <IonRippleEffect />
                    <IonSelectOption
                      v-for="subAssociation in subAssociations"
                      :key="subAssociation.id"
                      :value="subAssociation.id"
                    >
                      {{ subAssociation.name }}
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem
                  class="no-background no-padding"
                >
                  <IonLabel
                    class="small-label"
                    position="stacked"
                  >
                    Sortieren nach
                  </IonLabel>
                  <IonSelect
                    v-model="selectedSortOption"
                    class="block-select"
                    placeholder="Sortierung auswählen"
                  >
                    <IonSelectOption
                      v-for="sortOption in sortOptions"
                      :key="sortOption"
                      :value="sortOption"
                    >
                      {{ SortOptionLabels[sortOption] ?? sortOption }}
                    </IonSelectOption>
                  </IonSelect>
                </IonItem>
              </div>
            </CollapsibleFilters>
            <EventList
              v-model:events="events"
              v-model:pagination="eventsPagination"
              :filter-params="filterParams"
              :campaigns="campaigns"
            />
          </div>
        </IonContent>
      </ResizableBottomSheet>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from '@/lib/mapbox/Map.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import { EventDto } from '@/api/model/EventDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import Popup from '@/lib/mapbox/Popup.vue'
import { userStore } from '@/store/UserStore'
import Button from 'primevue/button'
import { LocationDto } from '@/api/model/LocationDto'
import {
  IonContent,
  IonItem,
  IonLabel, IonRippleEffect,
  IonSelect,
  IonSelectOption, toastController
} from '@ionic/vue'
import { Feature } from 'geojson'
import { ClusterDto } from '@/api/model/ClusterDto'
import ClusterLayer from '@/lib/mapbox/ClusterLayer.vue'
import { isEqual } from 'lodash-es'

const MAX_EVENTS = 100
import { showCampaignLevel } from '@/utils/showCampaignLevel'
import ResizableBottomSheet from '@/components/ResizableBottomSheet.vue'
import CollapsibleFilters from '@/components/CollapsibleFilters.vue'
import { SubAssociationDto } from '@/api/model/SubAssociationDto'
import EventList from '@/components/EventList.vue'
import { Pagination } from '@/api/model/APIEnvelope'

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
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonContent,
    IonItem,
    IonRippleEffect
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().location == null) {
      next({name: 'splash'})
    }
    next()
  },
  data() {
    return {
      iconWidth: 25,
      iconHeight: 40,
      center: userStore.getState().location,
      events: [] as EventDto[],
      eventsPagination: null as Pagination | null,
      campaigns: [] as CampaignDto[],
      clusters: [] as ClusterDto[],
      clusterMode: true,
      boundingBox: null as Feature | null,
      tooManyEventsWarningShowing: false,
      selectedSortOption: SortOption.START_DATE as SortOption,
      sortOptions: Object.values(SortOption),
      filteredSubAssociations: [] as number[],
      SortOptionLabels,
      subAssociations: [] as SubAssociationDto[]
    }
  },
  computed: {
    activatedFilterCount(): number {
      let active = 0
      if (this.filteredSubAssociations.length > 0) {
        active++
      }
      if (this.filteredCampaign > 0) {
        active++
      }
      return active
    },
    filteredCampaign: {
      get() {
        return userStore.getState().campaign ?? 0
      },
      set(value) {
        if (value < 1) {
          userStore.setCampaign(null)
        } else {
          userStore.setCampaign(value)
        }
      }
    },
    zoom: {
      get() {
        return userStore.getState().zoom
      },
      set(value: number) {
        userStore.setZoom(value)
      }
    },
    userLocation: {
      get() {
        return userStore.getState().location
      },
      set(value: LocationDto) {
        userStore.locate(value)
      }
    },
    filterParams(): { [key: string]: any } {
      return {
        sub_association: this.filteredSubAssociations.length > 0 ? this.filteredSubAssociations : undefined,
        campaigns: this.filteredCampaign > 0 ? this.filteredCampaign : undefined,
        within: this.boundingBox ? JSON.stringify(this.boundingBox.geometry) : undefined,
        order_by: this.selectedSortOption,
        limit: MAX_EVENTS
      }
    }
  },
  watch: {
    filterParams: {
      handler(newValue, oldValue) {
        if (isEqual(newValue, oldValue)) return
        this.updateView()
      },
      deep: true,
      immediate: true
    }
  },
  async created() {
    await this.getCampaigns()
    await this.getSubAssociations()
    if (userStore.getState().user?.sub_association) {
      this.filteredSubAssociations = [...this.filteredSubAssociations, userStore.getState().user!.sub_association!]
    }
  },
  methods: {
    showCampaignLevel,
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
        const toast = await toastController.create({
          color: 'warning',
          duration: 3500,
          header: 'Hier ist zuviel los',
          message: 'Nicht alle Aktionen werden angezeigt, da dies zuviel für die Karte wäre. Nutze die Listenansicht'
        })
        toast.onDidDismiss()
          .then(() => this.tooManyEventsWarningShowing = false)
        await toast.present()
        this.tooManyEventsWarningShowing = true
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
</style>
