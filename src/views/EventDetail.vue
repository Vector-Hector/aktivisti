<template>
  <IonContent
    v-if="event !== null && loading === false"
    class="event"
  >
    <div class="container">
      <IonGrid class="full-width">
        <IonRow>
          <IonCol>
            <span
              v-if="campaign"
              class="campaign"
            >{{ campaign.name }}</span>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <h2 class="event-name">
              {{ event.name }}
            </h2>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol size="2">
            Start:
          </IonCol>
          <IonCol
            size="10"
            class="start-date"
          >
            {{ new Date(event.start_date).toLocaleString([], dateOptions) }}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="2">
            Ende:
          </IonCol>
          <IonCol
            class="start-date"
            size="10"
          >
            {{ event.endDate ? new Date(event.end_date).toLocaleString([], dateOptions) : 'Nicht definiert' }}
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <span class="participants">
              <i class="pi pi-user" /> {{ event.participants.length }}/{{ event.max_participants ?? '∞' }}
            </span>
            <p class="description">
              {{ event.description }}
            </p>
          </IonCol>
        </IonRow>
      </IonGrid>


      <div
        class="areas"
      >
        <IonList
          v-if="isMember"
          class="area-list"
        >
          <IonItem
            v-for="area in eventAreas"
            :key="area.id"
            :button="true"
            @click="$router.push({ name: 'event-area-live', params: { id: area.id }})"
          >
            <IonLabel>
              <h3>{{ area.name }}</h3>
              <p>{{ countAddresses(area.area_details) }} Adressen</p>
            </IonLabel>
            <div
              slot="end"
              class="item-buttons"
            >
              <IonIcon
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
        </IonList>
      </div>

      <router-link
        v-if="!isLoggedIn"
        :to="{ name: 'login' }"
        button-type="tertiary"
      >
        <Button>
          Anmelden um mitzumachen
        </Button>
      </router-link>
      <IonButton
        v-else-if="isMember"
        :disabled="joinLoading"
        button-type="primary"
        @click="leave"
      >
        Doch nicht dabei
      </IonButton>
      <IonButton
        v-else-if="!isMember"
        :disabled="joinLoading"
        @click="join"
      >
        Ich bin dabei
      </IonButton>
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'
import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonRow } from '@ionic/vue'
import { ellipse, chevronForward } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { authService } from '@/api/authService'
import { userStore } from '@/store/UserStore'

addIcons({
  ellipse,
  chevronForward
})

export default defineComponent({
  name: 'EventDetail',
  components: {
    IonButton,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonGrid,
    IonCol,
    IonRow,
    IonContent
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      event: null as EventDto | null,
      eventAreas: [] as EventAreaDto[],
      campaign: null,
      loading: true,
      joinLoading: false,
      metrics: [
        {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
        {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
        {name: 'Gute Gespräche', value: 'Gute Gespräche'},
        {name: 'Zustimmung', value: 'Zustimmung'},
        {name: 'Unterschriften', value: 'Unterschriften'}
      ],
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  computed: {
    isLoggedIn(): boolean {
      return authService.isLoggedIn()
    },
    isMember(): boolean {
      return this.event?.participants.find((id) => id === userStore.getState().user?.id) !== undefined
    }
  },
  async created() {
    await this.getEvent()
    await this.getEventAreas()

    this.loading = false
  },
  methods: {
    async getEvent() {
      const eventRequest = (await this.$apiClient.events.get(this.id, ['campaign']))
      this.event = eventRequest.payload.data

      this.campaign = eventRequest.payload.embedded.campaign[0]
    },

    async getEventAreas() {
      if (this.event) {
        this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.event.id})).payload.data
      }
    },

    async join() {
      this.joinLoading = true
      this.event = (await this.$apiClient.events.join(this.id)).payload.data
      this.joinLoading = false
    },

    async leave() {
      this.joinLoading = true
      this.event = (await this.$apiClient.events.leave(this.id)).payload.data
      this.joinLoading = false
    },
    countAddresses(areaDetails: AreaDetailsDto) {
      return areaDetails.streets.reduce((acc, street) => {
        return acc + street.addresses.length
      }, 0)
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

Button {
  margin: 10px;
  background: $red;
  border: 1px solid $red;
}

.campaign {
  font-weight: bold;
  display: block;
}

.full-width {
  width: 100%;
}

.event-name {
  margin: 0 0 1rem 0;
}

.chevron {
  margin-left: 2rem;
  font-size: 2rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

</style>
