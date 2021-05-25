<template>
  <QList
    v-if="events.length > 0"
  >
    <QItem
      v-for="event in events"
      :key="event.id"
      clickable
      v-ripple
      @click="goToEvent(event)"
    >
      <QItemSection>
        <QItemLabel>
          <b>{{ event.name }}</b>
        </QItemLabel>
        <QItemLabel>
          {{ campaignsByIds(event.campaigns).map(({name}) => name).join(',') }}
        </QItemLabel>
      </QItemSection>
      <QItemSection avatar>
        <router-link
          v-if="isManager"
          :to="{ name: 'edit-event-details', params: { id: event.id } }"
          @click="$event.stopPropagation()"
        >
          <QIcon
            class="edit-button"
            name="ion-pencil"
          />
        </router-link>
        <a
          @click="$event.stopPropagation(); deleteEvent(event)"
        >
          <QIcon
            v-if="isManager"
            class="delete-button"
            name="ion-trash"
          />
        </a>
      </QItemSection>
    </QItem>
  </QList>

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


    <IonInfiniteScrollContent
      loading-spinner="bubbles"
      loading-text="Weitere Aktionen laden..."
    />
  </IonInfiniteScroll>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import {
  modalController,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import { trash, pencil, add } from 'ionicons/icons'
import ConfirmDelete from 'src/components/modals/ConfirmDelete.vue'
import { userStore } from 'src/store/UserStore'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import { QItem, QItemLabel, QItemSection, QList } from 'quasar'

interface CustomScrollEvent {
  target: {
    complete: () => void,
    disabled: boolean
  }
}

addIcons({
  trash, pencil, add
})

export default defineComponent({
  name: 'Events',
  components: {
    QList,
    QItem,
    QItemLabel,
    QItemSection,
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
      default: () => []
    },
    pagination: {
      type: Object as PropType<Pagination | null>,
      default: null
    },
    campaigns: {
      type: Array as PropType<CampaignDto[]>,
      default: () => []
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
      void this.$router.push({
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
      await confirmation.onDidDismiss()
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

      this.$emit('update:events', distinctBy(this.events.concat(moreEvents), (item: EventDto) => item.id))
      event.target.complete()
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables";

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
