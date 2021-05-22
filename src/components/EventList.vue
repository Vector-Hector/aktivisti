<template>
  <IonList
    v-if="events.length > 0"
  >
    <IonItem
      v-for="event in events"
      :key="event.id"
      :button="true"
      @click="goToEvent(event)"
    >
      <IonLabel>
        <h3>{{ event.name }}</h3>
        <p>{{ campaignsByIds(event.campaigns).map(({name}) => name).join(',') }}</p>
      </IonLabel>
      <div
        slot="end"
        class="item-buttons"
      >
        <router-link
          v-if="isManager"
          :to="{ name: 'edit-event-details', params: { id: event.id } }"
          @click="$event.stopPropagation()"
        >
          <IonIcon
            class="edit-button"
            name="pencil"
          />
        </router-link>
        <a
          @click="$event.stopPropagation(); deleteEvent(event)"
        >
          <IonIcon
            v-if="isManager"
            class="delete-button"
            name="trash"
          />
        </a>
      </div>
    </IonItem>
  </IonList>

  <div
    v-else
    class="empty-list-placeholder"
  >
    <IonText
      color="medium"
    >
      Keine Aktionen gefunden
    </IonText>
  </div>

  <IonInfiniteScroll
    threshold="100px"
    :disabled="isDisabled"
    @ionInfinite="loadData($event)"
  >
    <IonInfiniteScrollContent
      loading-spinner="bubbles"
      loading-text="Weitere Aktionen laden..."
    />
  </IonInfiniteScroll>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto.ts'
import { CampaignDto } from '@/api/model/CampaignDto.ts'
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  modalController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import { trash, pencil, add } from 'ionicons/icons'
import ConfirmDelete from '@/components/modals/ConfirmDelete.vue'
import { userStore } from '@/store/UserStore'
import { EVENT_LIST_CHUNK_SIZE } from '@/constants'
import { Pagination } from '@/api/model/APIEnvelope'
import { distinctBy } from '@/utils/array'

interface CustomScrollEvent {
  target: {
    complete: Function,
    disabled: boolean
  }
}

addIcons({
  trash, pencil, add
})

export default defineComponent({
  name: 'Events',
  components: {
    IonList,
    IonText,
    IonItem,
    IonLabel,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  },
  props: {
    filterParams: {
      type: Object as PropType<{ [key: string]: string }>,
      required: true
    },
    events: {
      type: Array as PropType<EventDto[]>,
      default: []
    },
    pagination: {
      type: Object as PropType<Pagination | null>,
      default: null
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      default: []
    }
  },
  emits: ['update:events', 'update:pagination'],
  computed: {
    isManager() {
      return userStore.isManager()
    },
    isDisabled(): boolean {
      return this.pagination?.total === this.events.length
    }
  },
  methods: {
    goToEvent(event: EventDto) {
      this.$router.push({
        name: 'event-detail',
        params: {
          id: event.id
        }
      })
    },
    async deleteEvent(event: EventDto) {
      const confirmation = await modalController
        .create({
          component: ConfirmDelete,
          componentProps: {
            event: event
          }
        })
      await confirmation.present()
      confirmation.onDidDismiss()
        .then(async (result) => {
          if (result.data) {
            try {
              await this.$apiClient.events.delete(event.id.toString())
            } catch (error) {
              this.$toast.add({
                severity: 'error',
                summary: `${error.statusText ? error.statusText : 'Dieser Eintrag konnte nicht gelöscht werden.'}`,
                detail: `Fehlercode: ${error.status}`
              })
              return
            }
            this.$emit('update:events', this.events.filter(({id}) => id !== event.id))
          }
        })
    },
    async getEvents() {
      const response = await this.$apiClient.events.list({
        ...this.filterParams,
        limit: EVENT_LIST_CHUNK_SIZE,
        offset: this.pagination?.offset
      })
      return response.payload.data
    },
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({id}) => findIds.includes(id))
    },
    async loadData(event: CustomScrollEvent) {
      if (this.isDisabled) {
        return
      }
      this.$emit('update:pagination', {
        ...this.pagination,
        offset: (this.events?.length ?? 0) + EVENT_LIST_CHUNK_SIZE
      })
      const moreEvents = await this.getEvents()

      this.$emit('update:events', distinctBy(this.events.concat(moreEvents), (item) => item.id))
      event.target.complete()
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../scss/globals';

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.autocomplete {
  padding-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.item-buttons {
  display: flex;
  align-items: center;
  font-size: 1.5rem;

  a {
    display: inline-flex;
    color: $black;
  }

  .delete-button {
    margin-left: 0.6rem;

  }
}

.empty-list-placeholder {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
</style>
