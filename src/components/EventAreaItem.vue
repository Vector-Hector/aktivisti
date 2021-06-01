<template>
  <QItem
    :clickable="true"
    :class="{ 'greyed-out': area.is_completed }"
    :to="{ name: 'event-detail-area', params: { areaId: area.id }}"
  >
    <QItemSection>
      <QItemLabel>
        {{ area.name }}
      </QItemLabel>

      <QItemLabel>
        {{ countAddresses(area.area_details) }} Adressen
      </QItemLabel>
    </QItemSection>

    <QItemSection side>
      <div
        class="item-buttons"
      >
        <span
          title="Ich nehme teil"
          class="popup-text"
        >
        <QIcon
          v-if="participationsOfArea.map(participation => participation.user).includes(user?.id)"
          class="area-indicator-icon"
          :name="ionPersonCircleOutline"
        />
      </span>
        <QBadge
          outline
          color="primary"
          class="participant-badge"
        >
          {{ participationsOfArea.length }}
        </QBadge>
        <QIcon
          v-if="area.is_completed"
          class="area-indicator-icon"
          :name="ionCheckmarkCircleOutline"
        />
        <QIcon
          v-else
          class="area-indicator-icon"
          :style="{
            color: area.color
          }"
          :name="ionEllipse"
        />
        <QIcon
          class="chevron"
          :name="ionChevronForward"
        />
      </div>
    </QItemSection>
  </QItem>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { UserDto } from 'src/api/model/UserDto'
import { userStore } from 'src/store/UserStore'
import { AreaDetailsDto } from 'src/api/model/AreaDetailsDto'
import { QBadge, QIcon, QItem, QItemLabel, QItemSection } from 'quasar'
import {
  ionCheckmarkCircleOutline,
  ionChevronForward,
  ionEllipse,
  ionPersonCircleOutline
} from '@quasar/extras/ionicons-v5'


export default defineComponent({
  name: 'EventAreaItem',
  components: {
    QIcon,
    QItem,
    QItemSection,
    QItemLabel,
    QBadge
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
  data() {
    return {
      ionPersonCircleOutline,
      ionCheckmarkCircleOutline,
      ionEllipse,
      ionChevronForward
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
    }
  }
})
</script>

<style lang="scss">

.chevron {
  margin-left: 1rem;
  font-size: 2rem;
}

.area-indicator-icon {
  font-size: 1.2rem;
  margin-left: 1rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.greyed-out {
  opacity: 0.3;
}

.popup-text {
  display: flex;
  color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);
}

.participant-badge {
  margin-left: 1rem;
}

</style>
