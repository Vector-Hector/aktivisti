<template>
  <DrawControl
    ref="draw"
    :features="features"
    :controls="drawControls"
    :styles="routePlannerStyles"
    :display-controls-default="false"
    @update:features="() => {}"
    @draw:create="handleCreatedFeatures"
    @draw:update="handleCreatedFeatures"
    @draw:delete="handleDeletedFeatures"
  />
  <template
    v-if="zoomLevel > 16">
    <AddressMarkerLayer
      :addresses="addresses"
    />
  </template>
  <Marker
    v-if="event.location"
    :location="event.location"
    @update:location="placeSuggestion = { location: $event }"
    :draggable="true"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import Marker from 'src/mapbox/Marker.vue'
import DrawControl from 'src/mapbox/DrawControl.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { routePlannerStyles } from './route-planner.styles'
import { Feature, Geometry } from 'geojson'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { bbox, booleanPointInPolygon, center as turfCenter, circle, polygon } from '@turf/turf'

import { MapInject } from 'src/mapbox/Map.vue'
import { EditEventBus, START_DRAW_AREA } from 'src/store/EditEventStore'
import { noop } from 'lodash-es'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { LocationDto } from 'src/api/model/LocationDto'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import AddressMarkerLayer from 'src/mapbox/AddressMarkerLayer'

const defaultColors = [
  '#E22A3A',
  '#37FFFF',
  '#91BF77',
  '#F8AC60',
  '#8E197C',
  '#9E2B25',
  '#266DD3',
  '#FDE74C',
  '#55DBCB',
  '#495D63'
]

export default defineComponent({
  name: 'EditEventGeometryMap',
  components: {
    AddressMarkerLayer,
    DrawControl,
    Marker
  },
  setup() {
    const map = inject(MapInject)
    return {
      map
    }
  },
  mixins: [EditEventGeometryMixin, InjectMapMixin],
  data() {
    return {
      routePlannerStyles: routePlannerStyles('#000000'),
      drawControls: {
        polygon: true,
        trash: true
      },
      zoomLevel: 0,
      zoomListener: noop,
      startDrawListener: noop
    }
  },
  computed: {
    features(): Feature[] {
      return this.eventAreas.map((area) => {
        return {
          type: 'Feature',
          geometry: area.geometry,
          id: area.feature_id,
          properties: {
            // find the corresponding area and copy the color
            color: area.color
          }
        }
      })
    },
    addresses(): AddressDetails[] | undefined {
      return this.eventAreas
        .map(({area_details}) => area_details?.streets ?? [])
        .flat()
        .map(({addresses}) => addresses)
        .flat()
    }
  },
  created() {
    this.zoomLevel = this.map?.getZoom() ?? 0
  },
  mounted() {
    this.startDrawListener = () => {
      (this.$refs.draw as typeof DrawControl).changeMode('draw_polygon')
    }
    EditEventBus.on(START_DRAW_AREA, this.startDrawListener)
    this.zoomListener = () => {
      this.zoomLevel = this.map?.getZoom() ?? Infinity
    }
    this.map?.on('zoomend', this.zoomListener)
  },
  unmounted() {
    this.map?.off('zoomend', this.zoomListener)
    EditEventBus.off(START_DRAW_AREA, this.startDrawListener)
  },
  watch: {
    'event.location': {
      handler() {
        const bounds = this.map?.getBounds()
        if (bounds) {
          const boundsGeometry = polygon([
            [
              [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
              [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
              [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
              [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
              [bounds.getNorthWest().lng, bounds.getNorthWest().lat]
            ]
          ])
          const {lat, lng} = this.event.location
          if (!booleanPointInPolygon([lng, lat], boundsGeometry)) {
            this.map?.fitBounds(bbox(circle([lng, lat], 2)) as BBox2d)
          }
        }
      },
      deep: true
    }
  },
  methods: {
    center(geometry: Geometry): LocationDto {
      //@ts-ignore
      const point = turfCenter(geometry)
      return {
        lat: point.geometry.coordinates[1],
        lng: point.geometry.coordinates[0]
      }
    },
    async handleCreatedFeatures(event: any) {
      for (const feature of event.features) {
        const existingArea = this.eventAreas.find((area) => area.feature_id === feature.id)
        const updatedArea = Object.assign(
          {
            name: `Gebiet ${this.eventAreas.length + 1}`,
            color: defaultColors[this.eventAreas.length] ?? defaultColors[0],
            event: this.event.id
          },
          existingArea ?? {},
          {
            feature_id: feature.id,
            geometry: feature.geometry
          }
        )
        if (existingArea) {
          this.eventAreas = this.eventAreas.map((area) => {
            if (area.feature_id === updatedArea.feature_id) {
              return updatedArea as EventAreaDto
            } else {
              return area
            }
          })
          await this.updateArea(updatedArea)
        } else {
          this.eventAreas.push(updatedArea as EventAreaDto)
          await this.updateArea(updatedArea)
        }
      }
    },
    handleDeletedFeatures(event: any) {
      const deletedFeatureIds = event.features.map(({id}: { id: string }) => id)
      for (const featureId of deletedFeatureIds) {
        void this.deleteAreaByFeatureId(featureId)
      }
    },
    drawArea() {
      (this.$refs.draw as typeof DrawControl).changeMode('draw_polygon')
    }
  }
})
</script>

