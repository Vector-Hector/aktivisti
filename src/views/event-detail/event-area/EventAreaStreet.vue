<template>
  <IonList>
    <IonItem
      v-for="address in sortedAddresses"
      :key="address.house_number"
      :button="true"
      @click="$router.push({ name: 'event-detail-area-metrics', params: { houseNumber: address.house_number, street: street } })"
    >
      <IonLabel>
        <h3>{{ street }} {{ address.house_number }}</h3>
      </IonLabel>
      <div slot="end">
        <IonIcon
          v-if="completionNotes.includes(address.osm_id)"
          class="finished-icon"
          name="checkmark-circle"
        />
        <IonIcon
          class="chevron"
          name="chevron-forward"
        />
      </div>
    </IonItem>
  </IonList>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue'
import { AddressDetails } from '@/api/model/AreaDetailsDto'
import EventAreaStreetMixin from '@/views/event-detail/event-area/EventAreaStreetMixin'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'
import { addIcons } from 'ionicons'
import { checkmarkCircle, chevronForward } from 'ionicons/icons'

addIcons({
  'checkmark-circle': checkmarkCircle,
  chevronForward
})


export default defineComponent({
  name: 'EventAreaStreet',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon
  },
  mixins: [EventAreaStreetMixin, EventAreaMixin],
  data() {
    return {
      nextPoll: null as number | null,
      completionNotes: [] as string[]
    }
  },
  computed: {
    sortedAddresses(): AddressDetails[] {
      const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
      return this.eventArea.area_details?.streets.find(({name}) => name === this.street)?.addresses?.sort((a, b) => {
        return collator.compare(a.house_number, b.house_number)
      }) ?? []
    }
  },
  created() {
    this.poll()
  },
  beforeUnmount() {
    if (this.nextPoll !== null) {
      clearTimeout(this.nextPoll!)
    }
  },
  methods: {
    async poll() {
      this.completionNotes = (await this.$apiClient.completionNotes.list({event_area: this.eventArea.id})).payload.data
        .filter(({completed}) => completed)
        .map(({target_id}) => target_id)
      this.nextPoll = setTimeout(() => this.poll(), 5000)
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

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

.finished-icon {
  margin-right: 1rem;
  color: $successButtonBg;
}

.full-width {
  width: 100%;
}

</style>
