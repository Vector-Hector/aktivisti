<script setup lang="ts">
import { QCardSection } from 'quasar'
import Map from 'src/mapbox/Map.vue'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import CampaignCollectionOverlay from 'src/mapbox/CampaignCollectionOverlay.vue'
import { Geometry } from 'geojson'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import hat from 'hat'

interface Props {
  collection: CampaignGeometryCollectionsDto
}

interface Emits {
  (e: 'onGeometryClick', eventAreas: Partial<EventAreaDto>[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleGeometryClick(geometryId: number, geometry: Geometry): void {
  const eventArea: Partial<EventAreaDto> = {
    name: props.collection.name,
    // We're using hat, to get the same schema for the future_id like mapbox see:
    // https://github.com/mapbox/mapbox-gl-draw/blob/2b9ce3e58e3695c018a48b6fca78ed1a9d1b67c2/src/feature_types/feature.js#L8
    feature_id: hat(),
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    geometry: geometry
  }
  emit('onGeometryClick', [eventArea])
}

</script>
<template>
  <QCardSection class="description-section">
      <span class="description">
          Bitte wähle ein Gebiet aus
      </span>
  </QCardSection>
  <QCardSection class="section">
    <Map>
      <CampaignCollectionOverlay :collection="props.collection" hover fit-map @geometry-click="handleGeometryClick" />
    </Map>
  </QCardSection>
</template>

<style lang="scss" scoped>
.section {
  display: flex;
  flex-direction: column;
  // TODO(peter): Find a better solution
  //  This seams to be kind of a bug of quasar see https://github.com/quasarframework/quasar/issues/5926
  //  The scroll area is not displayed the right way in combination with QDialog
  height: 0;
  flex-grow: 1;
}

.description {
  color: $grey-6;
  font-size: 0.75rem;
  line-height: 1;
  display: block;
}

.description-section {
  padding-bottom: 0;
}

</style>
