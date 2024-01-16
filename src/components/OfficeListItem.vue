<template>
  <QItem clickable v-ripple>
    <QItemSection>
      <QItemLabel>
        <b>{{ props.office.properties.name }}</b>
      </QItemLabel>
      <QItemLabel>
        {{ props.office.properties.location_description }}
      </QItemLabel>
      <QItemLabel v-if="props.office.properties.phone_number">
        {{ props.office.properties.phone_number }}
      </QItemLabel>
      <QItemLabel v-if="props.office.properties.description">
        {{ props.office.properties.description }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side v-if="office.properties.link">
      <QBtn
        type="a"
        :icon="ionEarthOutline"
        dense
        round
        :href="office.properties.link"
        target="_blank"
      ></QBtn>
    </QItemSection>
  </QItem>
</template>
<script setup lang="ts">
import { QBtn, QItem, QItemLabel, QItemSection } from 'quasar'
import { ionEarthOutline } from '@quasar/extras/ionicons-v5'
import { OfficeGeoJsonFeature } from 'src/api/model/OfficeGeoJsonDto'

interface Props {
  office: OfficeGeoJsonFeature
}

const props = defineProps<Props>()
</script>
<style lang="scss" scoped></style>
