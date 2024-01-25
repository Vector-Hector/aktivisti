<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QIcon, QItem, QItemLabel, QItemSection } from 'quasar'
import {
  PosterDto,
  PosterStatus,
  posterStatusOptions
} from 'src/api/model/PosterDto'
import {
  ionAlertCircle,
  ionCheckmarkCircle,
  ionCloseCircle
} from '@quasar/extras/ionicons-v5'

export default defineComponent({
  name: 'PosterListItem',
  components: {
    QIcon,
    QItem,
    QItemLabel,
    QItemSection
  },
  props: {
    poster: {
      type: Object as PropType<PosterDto>,
      required: true
    }
  },
  computed: {
    statusLabel(): string {
      return (
        posterStatusOptions.find(({ key }) => key === this.poster.status)
          ?.label ?? ''
      )
    },
    statusIcon(): string {
      switch (this.poster.status) {
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
      switch (this.poster.status) {
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

<template>
  <QItem clickable v-ripple>
    <QItemSection>
      <QItemLabel>
        <b>{{ poster.location_description }}</b>
      </QItemLabel>
    </QItemSection>
    <QItemSection side>
      <QItemLabel :class="statusClass">
        {{ statusLabel }}
      </QItemLabel>
    </QItemSection>
    <QItemSection side>
      <QIcon :name="statusIcon" :class="statusClass" />
    </QItemSection>
  </QItem>
</template>

<style lang="scss" scoped>
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
