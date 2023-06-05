<template>
  <QChip
    dense
    :color="mandatory ? 'primary' : null"
    :removable="!mandatory"
    @remove="scope.removeAtIndex(scope.index)"
    :tabindex="scope.tabindex"
  >
    <span :class="{ 'text-white': mandatory }">{{ metric.name }}</span>
  </QChip>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventMetricDto } from '../api/model/EventMetricDto'
import { QChip } from 'quasar'

export default defineComponent({
  name: 'MetricSelectChip',
  props: {
    metric: {
      type: Object as PropType<EventMetricDto>,
      required: true
    },
    mandatory: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    scope: {
      type: Object as PropType<any>,
      required: true
    },
    tabindex: {
      type: Number as PropType<number>,
      required: true
    }
  },
  components: {
    QChip
  },
  emits: ['remove']
})
</script>
