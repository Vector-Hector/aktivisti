<template>
  <div
    v-if="event !== null"
    class="event container"
  >
    <h2>{{ event.title }}</h2>
    <div class="p-grid">
      <span class="campaign p-col">{{ event.campaign }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Start:</span><span class="start-date p-col-10">{{
        new Date(event.startDate).toLocaleString([], dateOptions)
      }}</span>
    </div>
    <div class="p-grid">
      <span class="p-col-2">Ende:</span><span class="start-date p-col-10">{{
        event.endDate ? new Date(event.endDate).toLocaleString([], dateOptions): ''
      }}</span>
    </div>
    <div class="p-grid">
      <span class="participants p-col">
        <i class="pi pi-user" /> {{ event.participants.length }}/{{ event.maxParticipants }}</span>
    </div>
    <div class="p-grid">
      <p class="description p-col">
        {{ event.description }}
      </p>
    </div>
    <div class="p-grid  p-jc-end">
      <Button
        v-if="currentUserId === null"
        disabled="disabled"
      >
        Anmelden um mitzumachen
      </Button>
      <Button
        v-else-if="isMember"
        :disabled="joinLoading"
        class="gray-button"
        @click="leave"
      >
        Doch nicht dabei
      </Button>
      <Button
        v-else-if="!isMember"
        :disabled="joinLoading"
        @click="join"
      >
        Ich bin dabei
      </Button>
      <router-link
        v-if="isMember"
        :to="`/events/${event.id}/live`"
        class="no-button-decoration"
      >
        <Button>
          Starten
        </Button>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import Button from 'primevue/components/button/Button'
import { userStore } from '@/store/UserStore'

export default defineComponent({
  name: 'EventDetail',
  components: {
    Button
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
        minute:'2-digit'
      }
    }
  },
  computed: {
    currentUserId(): number | null {
      return userStore.getState().id
    },
    isMember(): boolean {
      return this.event?.participants.find((id) => id === this.currentUserId) !== undefined
    }
  },
  created() {
    this.getEvent()
  },
  methods: {
    async getEvent() {
      this.event = (await this.$apiClient.events.get(this.id)).payload.data
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
</style>
