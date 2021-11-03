<template>
  <QItem
    clickable
    v-ripple
  >
    <QItemSection>
      <QItemLabel>
        <b>{{ office.name }}</b>
      </QItemLabel>
      <QItemLabel>
        {{ office.location_description }}
      </QItemLabel>
      <QItemLabel v-if="office.phone_number">
        {{ office.phone_number }}
      </QItemLabel>
      <QItemLabel v-if="office.description">
        {{ office.description }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side v-if="office.link">
      <QBtn type="a" :icon="ionEarthOutline" dense round :href="office.link" target="_blank"></QBtn>
    </QItemSection>
  </QItem>
</template>
<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { QBtn, QItem, QItemLabel, QItemSection } from 'quasar'
import { OfficeDto } from 'src/api/model/OfficeDto'
import { ionEarthOutline } from '@quasar/extras/ionicons-v5'

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
      type: Object as PropType<OfficeDto>,
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
<style lang="scss" scoped>
</style>
