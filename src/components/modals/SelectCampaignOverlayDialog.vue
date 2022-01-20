<script setup lang="ts">
import {
  QBtn,
  QCard,
  QCardSection,
  QDialog,
  QIcon,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QToolbar,
  QToolbarTitle,
} from 'quasar'
import { useDialogPluginComponent } from 'quasar'
import { ionClose } from '@quasar/extras/ionicons-v5'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { apiClient } from 'src/api/ApiClient'
import { onMounted, ref } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { ionCheckmarkOutline } from '@quasar/extras/ionicons-v5'

interface Props {
  preselectedCollection: CampaignGeometryCollectionsDto
}
const props = defineProps<Props>()

defineEmits([
  // REQUIRED by QDialog, we need to emit some events through useDialogPluginComponent
  ...useDialogPluginComponent.emits
])

const {dialogRef, onDialogHide, onDialogCancel, onDialogOK} = useDialogPluginComponent()
const collections = ref<CampaignGeometryCollectionsDto[]>([])
const campaigns = ref<CampaignDto[]>([])

onMounted(async () => {
  campaigns.value = (await apiClient.campaigns.list()).payload.data
  collections.value = await fetchCollections(campaigns.value.map(({id}) => id))
})

/**
 * Fetch Campaign Geometry Collection
 * @param campaignIds - List of Campaign IDs
 */
async function fetchCollections(campaignIds: number[]): Promise<CampaignGeometryCollectionsDto[]> {
  const collections = []
  for (const id of campaignIds) {
    const campaignCollections = (await apiClient.campaignGeometryCollections.list({
      campaign: id
    })).payload.data
    collections.push(...campaignCollections)
  }
  return collections
}

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
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <QCard>
      <div
        class="bg-primary text-white"
      >
        <QToolbar class="toolbar">
          <QBtn
            @click="onDialogCancel"
            :icon="ionClose"
            flat
            round
            :ripple-effect="false"
          />
          <QToolbarTitle class="title-wrapper col">
            <span class="title">
            Overlays auswählen
            </span>
          </QToolbarTitle>
        </QToolbar>
      </div>
      <QCardSection>
        <div class="container col-grow">
          <QList>
            <QItem
              clickable
              @click="() => onDialogOK(null)"
              v-if="collections.length > 0"
            >
              <QItemSection>
                <QItemLabel>
                  <b>Kein Overlay anzeigen</b>
                </QItemLabel>
              </QItemSection>
            </QItem>
            <QItem
              clickable
              @click="() => onDialogOK(null)"
              v-else
            >
              <QItemSection>
                <QItemLabel>
                  <b>Kein Overlay definiert</b>
                </QItemLabel>
              </QItemSection>
            </QItem>
            <QItem clickable v-for="collection in collections" :key="collection.id"
                   @click="() => onDialogOK(collection)">
              <QItemSection>
                <QItemLabel>
                  <b>{{ collection.name }}</b>
                </QItemLabel>
                <QItemLabel>
                  {{ campaigns.find(({ id }) => id === collection.campaign).name }}
                </QItemLabel>
              </QItemSection>
              <QItemSection side v-if="props.preselectedCollection?.id === collection.id">
                <QIcon :name="ionCheckmarkOutline" color="green"/>
              </QItemSection>
            </QItem>
          </QList>
        </div>
      </QCardSection>
    </QCard>
  </QDialog>

</template>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

.campaign-collections {
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-block;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  white-space: nowrap;
  width: calc(100%);
  overflow: hidden;
}

.toolbar {
  height: 58px;
}
</style>
