<template>
  <IonItem
    :button="true"
    :class="{ 'greyed-out': area.is_completed }"
    @click="$router.push({ name: 'event-detail-area', params: { areaId: area.id }})"
  >
    <IonLabel>
      <h3>{{ area.name }}</h3>
      <p>{{ countAddresses(area.area_details) }} Adressen</p>
    </IonLabel>
    <IonIcon
      v-if="participationsOfArea.map(participation => participation.user).includes(user?.id)"
      class="area-indicator-icon"
      name="person-circle-outline"
    />
    <IonBadge
      slot="end"
      color="light"
    >
      {{ participationsOfArea.length }}
    </IonBadge>
    <div
      slot="end"
      class="item-buttons"
    >
      <IonIcon
        v-if="area.is_completed"
        class="area-indicator-icon"
        name="checkmark-circle-outline"
      />
      <IonIcon
        v-else
        class="area-indicator-icon"
        :style="{
          color: area.color
        }"
        name="ellipse"
      />
      <IonIcon
        class="chevron"
        name="chevron-forward"
      />
    </div>
  </IonItem>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { IonBadge, IonIcon, IonItem, IonLabel } from '@ionic/vue'
import { addIcons } from 'ionicons'
import {
  checkmarkCircleOutline,
  chevronForward,
  ellipse,
  personCircleOutline
} from 'ionicons/icons'
import { UserDto } from '@/api/model/UserDto'
import { userStore } from '@/store/UserStore'
import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'

addIcons({
  ellipse,
  chevronForward,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'person-circle-outline': personCircleOutline
})

export default defineComponent({
  name: 'EventAreaItem',
  components: {
    IonIcon,
    IonItem,
    IonLabel,
    IonBadge,
  },
  props: {
    area: {
      type: Object as PropType<EventAreaDto>,
      required: true
    },
    participations: {
      type: Object as PropType<EventParticipationDto[]>,
      required: true
    }
  },
  computed: {
    participationsOfArea(): EventParticipationDto[] {
      return this.participations
        .filter(({assigned_event_areas}) => assigned_event_areas.includes(this.area.id!))
    },
    user(): UserDto | null {
      return userStore.getState().user
    }
  },
  methods: {
    countAddresses(areaDetails: AreaDetailsDto) {
      return areaDetails.streets.reduce((acc, street) => {
        return acc + street.addresses.length
      }, 0)
    },
  }
})
</script>
<style lang="scss">

.chevron {
  margin-left: 2rem;
  font-size: 2rem;
}

.area-indicator-icon {
  font-size: 1.2rem;
  width: 1.7rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.greyed-out {
  opacity: 0.3;
}

</style>
