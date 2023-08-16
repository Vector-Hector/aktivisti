<script setup lang="ts">
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { QList, QItem, QItemLabel, QItemSection, QCardSection } from 'quasar'

interface Props {
  collections: CampaignGeometryCollectionsDto[] | null
  campaigns: CampaignDto[]
}

interface Emits {
  (e: 'onRecentEventAreasClick'): void
  (e: 'onSearchEventAreaClick'): void
  (
    e: 'onCampaignCollectionClick',
    collection: CampaignGeometryCollectionsDto
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSearchEventAreaClick(): void {
  emit('onSearchEventAreaClick')
}
function handleRecentEventAreasClick(): void {
  emit('onRecentEventAreasClick')
}

function handleCampaignCollectionClick(
  collection: CampaignGeometryCollectionsDto
): void {
  emit('onCampaignCollectionClick', collection)
}
</script>
<template>
  <QCardSection class="description-section">
    <span class="description"> Von wo möchtest du Gebiete übernehmen? </span>
  </QCardSection>
  <QCardSection class="section">
    <QList>
      <QItem clickable @click="handleSearchEventAreaClick">
        <QItemSection>
          <QItemLabel>
            <b>Nach Gebiet bei Namen suchen</b>
          </QItemLabel>
        </QItemSection>
      </QItem>
      <QItem clickable @click="handleRecentEventAreasClick">
        <QItemSection>
          <QItemLabel>
            <b>Aus vergangenen Aktionen</b>
          </QItemLabel>
        </QItemSection>
      </QItem>
      <QItem
        clickable
        v-for="collection in props.collections"
        :key="collection.id"
        @click="() => handleCampaignCollectionClick(collection)"
      >
        <QItemSection>
          <QItemLabel>
            <b>{{ collection.name }}</b>
          </QItemLabel>
          <QItemLabel>
            {{
              props.campaigns.find(({ id }) => id === collection.campaign).name
            }}
          </QItemLabel>
        </QItemSection>
      </QItem>
    </QList>
  </QCardSection>
</template>

<style lang="scss" scoped>
.section {
  display: flex;
  flex-direction: column;
  // TODO(peter): Find a better solution
  //  This seams to be kind of a bug of quasar see https://github.com/quasarframework/quasar/issues/5926
  //  The scroll area is not displayed the right way in combination with QDialog
  //height: 0;
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
