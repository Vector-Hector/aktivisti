<template>
  <QInfiniteScroll
    v-if="events.length > 0"
    @load="loadData"
    :disable="events.length === pagination.total"
  >
    <QList>
      <QItem
        v-for="item in events"
        :key="item.id"
        clickable
        v-ripple
        @click="goToEvent(item)"
      >
        <QItemSection>
          <QItemLabel>
            <b>{{ item.name }}</b>
          </QItemLabel>
          <QItemLabel>
            {{ campaignsByIds(item.campaigns).map(({name}) => name).join(',') }}
          </QItemLabel>
          <QItemLabel>
            {{ $utils.dateFormat(item.start_date) }}
          </QItemLabel>
        </QItemSection>

        <QItemSection side>
          <div class="text-grey-8 q-gutter-xs">
            <router-link
              v-if="isManager"
              class="text-grey-8"
              :to="{ name: 'edit-event-details', params: { id: item.id } }"
              @click="$event.stopPropagation()"
            >
              <QIcon
                flat
                dense
                class="edit-button"
                size="24px"
                :name="ionPencil"
              />
            </router-link>
            <a
              @click="$event.stopPropagation(); deleteEvent(item)"
            >
              <QIcon
                flat
                dense
                v-if="isManager"
                class="delete-button"
                size="24px"
                :name="ionTrash"
              />
            </a>
          </div>
        </QItemSection>
      </QItem>
    </QList>
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <QSpinnerDots color="primary" size="40px" />
      </div>
    </template>
  </QInfiniteScroll>
  <div
    v-else
    class="empty-list-placeholder"
  >

    Keine Aktionen gefunden
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { userStore } from 'src/store/UserStore'
import { EVENT_LIST_CHUNK_SIZE } from 'src/constants'
import { Pagination } from 'src/api/model/APIEnvelope'
import { distinctBy } from 'src/utils/array'
import { QIcon, QInfiniteScroll, QItem, QItemLabel, QItemSection, QList, QSpinnerDots } from 'quasar'
import { ionPencil, ionTrash } from '@quasar/extras/ionicons-v5'


export default defineComponent({
  name: 'Events',
  components: {
    QItem,
    QItemLabel,
    QItemSection,
    QInfiniteScroll,
    QSpinnerDots,
    QIcon,
    QList
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
      return userStore.isCampaignAdmin()
    },
    isDisabled(): boolean {
      return this.pagination?.total === this.events.length
    }
  },
  data() {
    return {
      ionTrash,
      ionPencil
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
    deleteEvent(event: EventDto) {
      this.$q.dialog({
        title: `${event.name} wirklich löschen?`,
        message: `Das Event <b>"${event.name}"</b> wird gelöscht und kann nicht wiederhergestellt werden.`,
        html: true,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await this.$apiClient.events.delete(event.id.toString())
          this.$emit('update:events', this.events.filter(({id}) => id !== event.id))
        } catch (error) {
          this.$toast.add({
            severity: 'error',
            summary: `${error.statusText ? error.statusText : 'Dieser Eintrag konnte nicht gelöscht werden.'}`,
            detail: `Fehlercode: ${error.status}`
          })
          return
        }
      })
    },
    async getEvents(pagination: Pagination) {
      const response = await this.$apiClient.events.list({
        ...this.filterParams,
        ...this.pagination,
        ...pagination
      })
      this.$emit('update:pagination', response.payload.pagination)
      return response.payload.data
    },
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({id}) => findIds.includes(id))
    },
    async loadData(index: number, done: () => void) {
      if (this.isDisabled) {
        return
      }
      const pagination = {
        ...this.pagination!,
        limit: EVENT_LIST_CHUNK_SIZE,
        offset: (this.events?.length ?? 0)
      }
      const moreEvents = await this.getEvents(pagination)
      this.$emit('update:events', distinctBy(this.events.concat(moreEvents), (item: EventDto) => item.id))
      done()
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
