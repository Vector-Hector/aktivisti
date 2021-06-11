<template>
  <QList>
    <QItem
      v-for="address in sortedAddresses"
      :key="address.house_number"
      :clickable="true"
      :to="{ name: 'event-detail-area-metrics', params: { houseNumber: address.house_number, street: street } }"
    >
      <QItemSection>
        <QItemLabel>
          {{ street }} {{ address.house_number }}
        </QItemLabel>
      </QItemSection>
      <QItemSection side>
        <div class="row">
          <QIcon
            v-if="completedTargetIds.includes(address.osm_id)"
            class="col finished-icon item-icon"
            :name="ionCheckmarkCircle"
          />
          <QIcon
            class="col item-icon"
            :name="ionChevronForward"
          />
        </div>
      </QItemSection>
    </QItem>
  </QList>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { uiStore } from 'src/store/UiStore'
import Timeout = NodeJS.Timeout
import EventAreaStreetMixin from 'pages/event-map/detail/area/street/EventAreaStreetMixin'
import { ionCheckmarkCircle, ionChevronForward } from '@quasar/extras/ionicons-v5'
import { QIcon, QItem, QItemLabel, QItemSection, QList } from 'quasar'


export default defineComponent({
  name: 'EventAreaStreet',
  components: {
    QList,
    QItemLabel,
    QItem,
    QItemSection,
    QIcon
  },
  mixins: [EventAreaStreetMixin],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      uiStore.updateActiveElements({
        // @ts-ignore
        street: vm.street
      })
    })
  },
  data() {
    return {
      nextPoll: null as Timeout | null,
      ionChevronForward,
      ionCheckmarkCircle
    }
  },
  computed: {
    sortedAddresses(): AddressDetails[] {
      const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
      const streets = this.eventArea.area_details?.streets.find(({name}) => name === this.street)
      if (streets) {
        return [...streets.addresses].sort((a, b) => {
          return collator.compare(a.house_number, b.house_number)
        })
      } else {
        return []
      }
    }
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

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
  color: $successButtonBg;
}



.item-icon {
  height: 24px;
}

</style>
