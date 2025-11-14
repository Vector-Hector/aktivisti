<script setup lang="ts">
import { QCardSection, QBtn } from 'quasar'
import Map from 'src/map/Map.vue'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import CampaignCollectionOverlay from 'src/map/CampaignCollectionOverlay.vue'
import { Geometry } from 'geojson'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import hat from 'hat'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import { useI18n } from 'vue-i18n'
import { Ref, ref } from 'vue'

interface Props {
  collection: CampaignGeometryCollectionsDto
}

interface Emits {
  (e: 'onGeometryClick', eventAreas: Partial<EventAreaDto>[]): void
  (e: 'onBackClick'): void
  (e: 'onAbortClick'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { eventAreas } = useEditEventMixin()
const { t } = useI18n()

const selectedEventAreas: Ref<globalThis.Map<number, Partial<EventAreaDto>>> =
  ref(new globalThis.Map())
const selectAllClickCounter = ref(0)

function handleGeometryClick(
  geometryId: number,
  geometry: Geometry,
  metadata: any
): void {
  if (selectedEventAreas.value.has(geometryId)) {
    selectedEventAreas.value.delete(geometryId)
  } else {
    const nameKey = Object.keys(metadata).find(
      (key) => key.toUpperCase() === 'NAME'
    )
    const eventArea: Partial<EventAreaDto> = {
      name: nameKey
        ? metadata[nameKey]
        : `${t('events.edit.geometry.areas.prefixNewArea')} ${eventAreas.value.length + selectedEventAreas.value.size + 1}`,
      // We're using hat, to get the same schema for the future_id like mapbox see:
      // https://github.com/mapbox/mapbox-gl-draw/blob/2b9ce3e58e3695c018a48b6fca78ed1a9d1b67c2/src/feature_types/feature.js#L8
      feature_id: hat(),
      color: generateRandomHexColorCode(),
      geometry: geometry
    }
    selectedEventAreas.value.set(geometryId, eventArea)
  }
}

function handleAdoptClick(): void {
  if (selectedEventAreas.value.size > 0) {
    const eventAreas: Partial<EventAreaDto>[] = Array.from(
      selectedEventAreas.value.values()
    )

    emit('onGeometryClick', eventAreas)
  }
}

function handleSelectAllClick(): void {
  selectAllClickCounter.value++
}

function handleBackClick(): void {
  emit('onBackClick')
}
function handleAbortClick(): void {
  emit('onAbortClick')
}

/**
 * Generates a random hex color code from range #000000 to #FFFFFF
 */
function generateRandomHexColorCode() {
  // 16777215 = (16^6 - 1), which is total count of possible hex of length 6 (hex color codes)
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}
</script>
<template>
  <QCardSection class="description-section">
    <span class="description">
      {{ $t('adoptEventAreas.campaignCollections.description') }}
    </span>
  </QCardSection>
  <QCardSection class="section">
    <Map>
      <CampaignCollectionOverlay
        :collection="props.collection"
        :selectedEventAreaIds="Array.from(selectedEventAreas.keys())"
        :triggerSelectAll="selectAllClickCounter"
        hover
        fit-map
        @geometry-click="handleGeometryClick"
      />
    </Map>
  </QCardSection>
  <QCardSection>
    <QCardActions>
      <div>
        <QBtn
          color="primary"
          outline
          dense
          :label="$t('general.cancel')"
          @click="handleAbortClick"
        />
        <QBtn
          color="primary"
          outline
          dense
          :label="$t('general.back')"
          @click="handleBackClick"
        />
      </div>
      <div>
        <QBtn
          color="primary"
          outline
          dense
          :label="$t('adoptEventAreas.campaignCollections.selectAll')"
          @click="handleSelectAllClick"
        />
        <QBtn
          color="primary"
          outline
          dense
          :disable="selectedEventAreas.size === 0"
          :label="$t('adoptEventAreas.campaignCollections.adopt')"
          @click="handleAdoptClick"
        />
      </div>
    </QCardActions>
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
.q-card__section {
  qcardactions {
    display: flex;
    justify-content: space-between;
    div {
      display: flex;
      button {
        &:not(:first-child) {
          margin-left: 8px;
        }
        &:last-child {
          float: right;
        }
      }
    }
  }
}
</style>
