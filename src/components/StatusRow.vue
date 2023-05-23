<template>
  <div class="status-row" :class="statusClass">
    <span class="label">
      {{ statusLabel }}
    </span>
    <QIcon class="icon" :name="statusIcon"> </QIcon>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { PosterStatus, posterStatusOptions } from 'src/api/model/PosterDto'
import {
  ionAlertCircle,
  ionCheckmarkCircle,
  ionCloseCircle
} from '@quasar/extras/ionicons-v5'
import { QIcon } from 'quasar'

export default defineComponent({
  name: 'StatusRow',
  components: {
    QIcon
  },
  props: {
    status: {
      type: String as PropType<PosterStatus>
    }
  },
  computed: {
    statusLabel(): string {
      return (
        posterStatusOptions.find(({ key }) => key === this.status)?.label ?? ''
      )
    },
    statusIcon(): string {
      switch (this.status) {
        case PosterStatus.MOUNTED:
          return ionCheckmarkCircle
        case PosterStatus.DAMAGED:
          return ionAlertCircle
        case PosterStatus.ABSENT:
        default:
          return ionCloseCircle
      }
    },
    statusClass(): string {
      switch (this.status) {
        case PosterStatus.MOUNTED:
          return 'mounted'
        case PosterStatus.DAMAGED:
          return 'damaged'
        case PosterStatus.ABSENT:
        default:
          return 'absent'
      }
    }
  }
})
</script>
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
