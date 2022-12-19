<template>
  <QDialog
    ref="dialog"
    @hide="onDialogHide"
    :full-width="$q.screen.lt.md"
    :full-height="$q.screen.lt.md"
  >
    <QCard class="select-poster-location-modal">
      <QToolbar>
        <QToolbarTitle>Neuer Plakatstandort</QToolbarTitle>
      </QToolbar>
      <QCardSection
        class="flex-fill d-flex"
      >
        <div class="select-poster-location-content">
          <div class="location-select">
            <LocationSelect
              v-model:location="location"
              v-model:location-description="location_description"
              :is-draggable-marker-shown="!$q.platform.is.mobile"
            >
              <template v-slot:hintText v-if="$q.platform.is.mobile">
                Bitte gib entweder eine Adresse in das Suchfeld ein oder nutze die
                  <span style="white-space: nowrap">
                    Ortungsfunktion
                    <QIcon :name="matGpsNotFixed"
                           flat
                           round
                    />
                  </span>
                um die Position dieses Standorts auf der Karte festzulegen.
              </template>
              <template v-else v-slot:hintText>
                Bitte geben Sie entweder eine Adresse in das Suchfeld ein oder verschieben Sie den rot hervorgehobenen Pin auf der Karte, um die Position dieses Standorts auf der Karte festzulegen.
              </template>
            </LocationSelect>
          </div>
          <Map
            :bounding-box="initialBBox"
            ref="map"
            class="flex-fill"
          >
            <template v-slot:top-right>
              <div class="flex column q-gutter-y-sm">
                <GeolocationControl
                  @position="location = $event"
                  :locator-icon-fixed="locatePosterLocation"
                />
                <ResetRotateControl />
              </div>
            </template>
            <AreaFeatureLayer
              :features="areaFeatures"
            />
            <PosterMarkerLayer
              :posters="posters"
              :editable="false"
              :opacity="0.2"
            />
            <PosterMarkerLayer
              :posters="newPoster"
              :editable="true"
              :active-poster-index="0"
              @update:posters="onPosterMove"
              :opacity="1"
            />
            <div class="accept-overlay">
              <QBtn
                v-if="location"
                class="accept-button"
                label="Plakat erstellen"
                color="primary"
                @click="createPoster"
              />
            </div>
          </Map>
        </div>
      </QCardSection>
    </QCard>
  </QDialog>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import LocationSelect from 'components/LocationSelect.vue'
import Map from 'src/map/Map.vue'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import { LocationDto } from 'src/api/model/LocationDto'
import { PosterDto, PosterMount, PosterStatus } from 'src/api/model/PosterDto'
import { QBtn, QIcon, QCard, QCardSection, QDialog, QToolbar, QToolbarTitle } from 'quasar'
import { matGpsNotFixed } from '@quasar/extras/material-icons'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, booleanPointInPolygon, circle, polygon } from '@turf/turf'
import GeolocationControl from 'src/map/GeolocationControl.vue'
import { Feature } from 'geojson'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import ResetRotateControl from 'src/map/ResetRotateControl.vue'

const locatePosterLocation = 'M 11 1 L 11 3.0605469 C 6.9292823 3.4392938 3.4392938 6.9292823 3.0605469 11 L 1 11 L 1 13 L 3.0605469 13 C 3.4392938 17.070718 6.9292823 20.560706 11 20.939453 L 11 23 L 13 23 L 13 20.939453 C 17.070718 20.560706 20.560706 17.070718 20.939453 13 L 23 13 L 23 11 L 20.939453 11 C 20.560706 6.9292823 17.070718 3.4392938 13 3.0605469 L 13 1 L 11 1 z M 12.167969 4.9960938 C 14.612648 5.075125 17.013782 6.4543302 18.15625 8.6621094 C 19.822507 11.597734 18.937201 15.646674 16.189453 17.611328 C 14.991374 18.512234 13.498747 19.005063 12 19 C 8.6447009 19.072687 5.5217141 16.392143 5.0800781 13.066406 C 4.5120542 9.8095174 6.6039595 6.3672332 9.7539062 5.3671875 C 10.533409 5.0871265 11.353076 4.96975 12.167969 4.9960938 z M 11.785156 7.1757812 C 9.7163517 7.2403558 8.0366925 9.4152354 8.5722656 11.443359 C 9.1280273 13.633696 10.562333 15.473577 11.986328 17.175781 C 13.453094 15.405674 14.980833 13.489093 15.447266 11.181641 C 15.805411 9.1349282 14.060747 7.1231736 11.986328 7.1757812 C 11.918842 7.173397 11.851892 7.1736982 11.785156 7.1757812 z M 11.912109 9.3886719 C 12.145667 9.3785629 12.407255 9.4527612 12.685547 9.640625 C 13.70672 10.27255 13.186776 11.972153 11.986328 11.925781 C 10.180087 11.928481 10.650896 9.4432604 11.912109 9.3886719 z'


export default defineComponent({
  name: 'SelectPosterLocation',
  components: {
    ResetRotateControl,
    AreaFeatureLayer,
    GeolocationControl,
    QDialog,
    QToolbar,
    QBtn,
    QIcon,
    QCard,
    QCardSection,
    QToolbarTitle,
    Map,
    PosterMarkerLayer,
    LocationSelect
  },
  props: {
    posters: {
      type: Array as PropType<PosterDto[]>,
      default: () => []
    },
    initialBBox: {
      type: Object as PropType<BBox2d>,
      required: false
    },
    eventId: {
      type: Number as PropType<number>,
      required: true
    },
    areaFeatures: {
      type: Array as PropType<Feature[]>
    }
  },
  emits: [
    'ok', 'hide'
  ],
  computed: {
    mapRef(): InstanceType<typeof Map> | undefined {
      return this.$refs.map as InstanceType<typeof Map> | undefined
    },
    newPoster(): Partial<PosterDto>[] {
      return [{
        location: this.location ?? undefined,
        location_description: this.location_description
      }]
    }
  },
  methods: {
    async createPoster() {
      try {
        const posterRequest = await this.$apiClient.posters.create({
          location: this.location!,
          location_description: this.location_description,
          mounted_on: PosterMount.LAMPPOST,
          status: PosterStatus.ABSENT,
          event: this.eventId
        })
        this.$emit('ok', posterRequest.payload.data)
        this.hide()
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: 'Das Plakat konnte nicht angelegt werden'
        })
      }
    },
    show() {
      // @ts-ignore
      this.$refs.dialog.show()
    },
    hide() {
      // @ts-ignore
      this.$refs.dialog.hide()
    },
    onDialogHide() {
      this.$emit('hide')
    },
    onPosterMove(posters: PosterDto[]) {
      const poster = posters[0]!
      this.location = poster.location
    }
  },
  data() {
    return {
      location: null as LocationDto | null,
      location_description: '',
      locatePosterLocation,
      matGpsNotFixed
    }
  },
  watch: {
    location: {
      handler() {

        const map = this.mapRef?.map
        const
          bounds = map?.getBounds()
        if (bounds && this.location) {
          const boundsGeometry = polygon([
            [
              [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
              [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
              [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
              [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
              [bounds.getNorthWest().lng, bounds.getNorthWest().lat]
            ]
          ])
          const {lat, lng} = this.location
          if (!booleanPointInPolygon([lng, lat], boundsGeometry)) {
            map?.fitBounds(bbox(circle([lng, lat], .5)) as BBox2d)
          }
        }
      },
      deep: true
    }
  }
})
</script>
<style lang="scss" scoped>
.location-select {
  margin-top: -1.5rem;
}

.select-poster-location-modal {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.select-poster-location-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}


.accept-button {
  box-shadow: $menu-box-shadow;
  left: 50%;
  right: 50%;
  position: absolute;
  z-index: 10;
  bottom: 1rem;
  transform: translateX(-50%);
}

</style>
