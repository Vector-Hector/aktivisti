<template>
  <QItem clickable v-ripple>
    <QItemSection>
      <QItemLabel>
        <b>{{ office.properties.name }}</b>
      </QItemLabel>
      <QItemLabel>
        {{ office.properties.location_description }}
      </QItemLabel>
      <QItemLabel v-if="office.properties.phone_number">
        {{ office.properties.phone_number }}
      </QItemLabel>
      <QItemLabel v-if="office.properties.description">
        {{ office.properties.description }}
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
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QBtn, QItem, QItemLabel, QItemSection } from 'quasar'
import { ionEarthOutline } from '@quasar/extras/ionicons-v5'
import { OfficeGeoJsonFeature } from 'src/api/model/OfficeGeoJsonDto'

export default defineComponent({
  name: 'OfficeListItem',
  components: {
    QBtn,
    QItem,
    QItemLabel,
    QItemSection
  },
  props: {
    office: {
      type: Object as PropType<OfficeGeoJsonFeature>,
      required: true
    }
  },
  emits: [''],
  data() {
    return {
      ionEarthOutline
    }
  }
})
</script>
<style lang="scss" scoped></style>
