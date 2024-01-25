<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  street: string
}
export default {
  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      uiStore.updateActiveElements({
        street: (vm as IInstance).street
      })
    })
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, computed } from 'vue'
import { uiStore } from 'src/store/UiStore'
import {
  ionCheckmarkCircle,
  ionChevronForward
} from '@quasar/extras/ionicons-v5'
import {
  QIcon,
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QScrollArea
} from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

interface Props {
  street: string
}
const props = defineProps<Props>()

const { completedTargetIds, eventArea } = useEventDetailStore()

const sortedAddresses = computed(() => {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
  })
  const street = eventArea.value?.area_details?.streets.find(
    ({ name }) => name === props.street
  )
  if (street) {
    return [...street.addresses].sort((a, b) => {
      return collator.compare(a.house_number, b.house_number)
    })
  } else {
    return []
  }
})

defineExpose({ street: props.street })
</script>

<template>
  <QScrollArea class="d-flex flex-fill">
    <div class="container">
      <QList>
        <QItem
          v-for="address in sortedAddresses"
          :key="address.house_number"
          :clickable="true"
          :to="{
            name: 'event-detail-area-metrics',
            params: { houseNumber: address.house_number, street: street }
          }"
        >
          <QItemSection>
            <QItemLabel> {{ street }} {{ address.house_number }} </QItemLabel>
          </QItemSection>
          <QItemSection side>
            <div class="row">
              <QIcon
                v-if="completedTargetIds.includes(address.osm_id.toString())"
                class="col finished-icon item-icon"
                :name="ionCheckmarkCircle"
              />
              <QIcon class="col item-icon" :name="ionChevronForward" />
            </div>
          </QItemSection>
        </QItem>
      </QList>
    </div>
  </QScrollArea>
</template>

<style lang="scss" scoped>
label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

.full-width {
  width: 100%;
}

.finished-icon {
  margin-right: 1rem;
  color: #4caf50;
}

.item-icon {
  height: 24px;
}
</style>
