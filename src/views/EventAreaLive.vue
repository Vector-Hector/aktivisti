<template>
  <IonContent
    v-if="eventArea !== null"
    class="event"
  >
    <div class="container">
      <IonGrid class="full-width">
        <IonRow>
          <IonCol>
            <h2>Gebiet: {{ eventArea.name }}</h2>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <span class="event-name">{{ event.name }}</span>

          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <router-view
              v-slot="{Component}"
              :event-area="eventArea"
            >
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { EventDto } from '@/api/model/EventDto'
import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/vue'


export default defineComponent({
  name: 'EventAreaLive',
  components: {
    IonContent,
    IonGrid,
    IonRow,
    IonCol
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
      eventArea: null as EventAreaDto | null,
      progress: 0
    }
  },
  created() {
    this.getEventArea()
  },
  methods: {
    async getEventArea() {
      const eventAreaRequest = await this.$apiClient.eventAreas.get(this.id, ['event'])
      this.eventArea = eventAreaRequest.payload.data
      this.event = eventAreaRequest.payload.embedded.event[0]
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

.full-width {
  width: 100%;
}


</style>
