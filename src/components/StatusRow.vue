<script setup lang="ts">
import { computed } from 'vue'
import { PosterStatus, usePosterOptions } from 'src/api/model/PosterDto'
import {
  ionAlertCircle,
  ionCheckmarkCircle,
  ionCloseCircle
} from '@quasar/extras/ionicons-v5'
import { QIcon } from 'quasar'

interface Props {
  status: PosterStatus
}
const props = defineProps<Props>()

const { posterStatusOptions } = usePosterOptions()

const statusLabel = computed(() => {
  return (
    posterStatusOptions.find(({ key }) => key === props.status)?.label ?? ''
  )
})
const statusIcon = computed(() => {
  switch (props.status) {
    case PosterStatus.MOUNTED:
      return ionCheckmarkCircle
    case PosterStatus.DAMAGED:
      return ionAlertCircle
    case PosterStatus.ABSENT:
    default:
      return ionCloseCircle
  }
})
const statusClass = computed(() => {
  switch (props.status) {
    case PosterStatus.MOUNTED:
      return 'mounted'
    case PosterStatus.DAMAGED:
      return 'damaged'
    case PosterStatus.ABSENT:
    default:
      return 'absent'
  }
})
</script>

<template>
  <div class="status-row" :class="statusClass">
    <span class="label">
      {{ statusLabel }}
    </span>
    <QIcon class="icon" :name="statusIcon"> </QIcon>
  </div>
</template>

<style lang="scss" scoped>
.status-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  .label {
    font-size: 0.9rem;
  }
  .icon {
    font-size: 1.3rem;
    margin-left: 0.4rem;
  }
}

.mounted {
  color: $positive;
}

.damaged {
  color: $negative;
}

.absent {
  color: $grey-5;
}
</style>
