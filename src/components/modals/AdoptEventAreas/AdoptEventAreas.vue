<script setup lang="ts">
import {
  QBtn,
  QCard,
  QCardActions,
  QDialog,
  QToolbar,
  QToolbarTitle,
  QToggle
} from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import { CampaignDto } from 'src/api/model/CampaignDto'
import SelectAreaSet from 'components/modals/AdoptEventAreas/SelectAreaSet.vue'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { computed, onMounted, ref } from 'vue'
import RecentEventAreas from 'components/modals/AdoptEventAreas/RecentEventAreas.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import CampaignCollections from 'components/modals/AdoptEventAreas/CampaignCollections.vue'
import { apiClient } from 'src/api/ApiClient'
import SearchEventArea from 'components/modals/AdoptEventAreas/SearchEventArea.vue'
import { CAMPAIGN_GEOMETRY_COLLECTIONS_CHUNK_SIZE } from 'src/constants'

interface Props {
  campaigns: CampaignDto[]
  showAdoptPosters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAdoptPosters: false
})
defineEmits([
  // REQUIRED by QDialog, we need to emit some events through useDialogPluginComponent
  ...useDialogPluginComponent.emits
])

enum Page {
  SELECT_AREA_SET,
  SEARCH_EVENT_AREAS,
  RECENT_EVENT_AREAS,
  CAMPAIGN_COLLECTIONS
}

const { dialogRef, onDialogHide, onDialogCancel, onDialogOK } =
  useDialogPluginComponent()

const page = ref<Page>(Page.SELECT_AREA_SET)

const campaignIds = computed(() => props.campaigns.map(({ id }) => id))
const campaignCollections = ref<CampaignGeometryCollectionsDto[]>([])
const isCollectionExisting = computed(
  () => campaignCollections.value.length > 0
)

const campaignCollection = ref<CampaignGeometryCollectionsDto | null>(null)
const adoptPosters = ref(false)

const offsetCampaignCollections = ref(0)
const totalCampaignCollections = ref(CAMPAIGN_GEOMETRY_COLLECTIONS_CHUNK_SIZE)
const areAllCollectionsLoaded = computed(
  () => offsetCampaignCollections.value >= totalCampaignCollections.value
)

onMounted(async () => {
  await fetchMoreCollections()
})

/**
 * Fetch Campaign Geometry Collection
 */
async function fetchMoreCollections() {
  if (!areAllCollectionsLoaded.value) {
    const response = (
      await apiClient.campaignGeometryCollections.list({
        campaign: campaignIds.value,
        limit: CAMPAIGN_GEOMETRY_COLLECTIONS_CHUNK_SIZE,
        offset: offsetCampaignCollections.value,
        order_by: 'name'
      })
    ).payload
    const { data, pagination } = response
    totalCampaignCollections.value = pagination?.total ?? 0
    campaignCollections.value = campaignCollections.value.concat(data)
    offsetCampaignCollections.value =
      offsetCampaignCollections.value + CAMPAIGN_GEOMETRY_COLLECTIONS_CHUNK_SIZE
  }
}

function handleSearchEventAreasClick() {
  page.value = Page.SEARCH_EVENT_AREAS
}

function handleRecentEventAreasClick() {
  page.value = Page.RECENT_EVENT_AREAS
}

function handleCampaignCollectionClick(
  collection: CampaignGeometryCollectionsDto
) {
  page.value = Page.CAMPAIGN_COLLECTIONS
  campaignCollection.value = collection
}

function handleAreaClick(eventAreas: EventAreaDto[]) {
  onDialogOK({ eventAreas: eventAreas, adoptPosters: adoptPosters.value })
}

async function loadMoreCollections(index: number, done: () => void) {
  await fetchMoreCollections()
  done()
}

const qCardClass = computed(() => {
  if (
    page.value === Page.RECENT_EVENT_AREAS ||
    (page.value === Page.SELECT_AREA_SET && isCollectionExisting.value)
  ) {
    return 'higher-content'
  }
  if (page.value === Page.CAMPAIGN_COLLECTIONS) {
    return 'higher-content broader-content'
  }
  return ''
})

const isPageWithAdoptPostersButton = computed(() => {
  return (
    props.showAdoptPosters &&
    [Page.RECENT_EVENT_AREAS, Page.SEARCH_EVENT_AREAS].includes(page.value)
  )
})

defineExpose({
  // REQUIRED by QDialog to expose `dialogRef`
  dialogRef,
  // REQUIRED by QDialog to expose `onDialogHide`
  onDialogHide
})
</script>

<template>
  <QDialog
    ref="dialogRef"
    @hide="onDialogHide"
    :full-width="$q.screen.lt.md"
    :full-height="$q.screen.lt.md"
  >
    <QCard class="adopt-events-modal" :class="qCardClass">
      <QToolbar>
        <QToolbarTitle>Gebiete übernehmen</QToolbarTitle>
      </QToolbar>
      <SelectAreaSet
        v-if="page === Page.SELECT_AREA_SET"
        :campaigns="props.campaigns"
        :collections="campaignCollections"
        :disabledCollectionLoading="areAllCollectionsLoaded"
        @loadCollections="loadMoreCollections"
        @onSearchEventAreaClick="handleSearchEventAreasClick"
        @onRecentEventAreasClick="handleRecentEventAreasClick"
        @onCampaignCollectionClick="handleCampaignCollectionClick"
      />
      <SearchEventArea
        v-if="page === Page.SEARCH_EVENT_AREAS"
        @onEventAreaClick="(area) => handleAreaClick([area])"
      />
      <RecentEventAreas
        v-if="page === Page.RECENT_EVENT_AREAS"
        @onEventClick="handleAreaClick"
      />
      <CampaignCollections
        v-if="page === Page.CAMPAIGN_COLLECTIONS"
        :collection="campaignCollection!"
        @onGeometryClick="handleAreaClick"
      />
      <QCardActions align="left">
        <QBtn
          color="primary"
          outline
          dense
          label="Abbrechen"
          @click="onDialogCancel"
        />
        <QBtn
          v-if="
            [
              Page.CAMPAIGN_COLLECTIONS,
              Page.RECENT_EVENT_AREAS,
              Page.SEARCH_EVENT_AREAS
            ].includes(page) && isCollectionExisting
          "
          color="primary"
          outline
          dense
          label="Zurück"
          @click="
            () => {
              page = Page.SELECT_AREA_SET
            }
          "
        />
        <QToggle
          v-if="isPageWithAdoptPostersButton"
          v-model="adoptPosters"
          label="Plakatstandorte übernehmen"
        ></QToggle>
      </QCardActions>
    </QCard>
  </QDialog>
</template>
<style lang="scss" scoped>
.adopt-events-modal {
  min-height: 250px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.higher-content {
  height: 100%;
}

.broader-content {
  min-width: 800px;
}
</style>
