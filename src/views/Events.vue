<template>
  <div class="page">
    <IonContent>
      <div class="container">
        <div class="autocomplete">
          <IonSelect
            v-model="filteredCampaigns"
            :multiple="true"
            placeholder="Alle Kampagnen"
            :selected-text="campaigns.filter(campaign => filteredCampaigns?.includes(campaign.id)).map(campaign => campaign.name).join(', ')"
          >
            <IonSelectOption
              v-for="campaign in campaigns"
              :key="campaign.id"
              :value="campaign.id"
            >
              {{ campaign.name }}
            </IonSelectOption>
          </IonSelect>
        </div>
        <div class="buttons">
          <router-link
            v-if="isManager"
            :to="{ name: 'edit-event-details-new' }"
          >
            <IonButton
              color="primary"
            >
              <IonIcon
                name="add"
              />
              Event erstellen
            </IonButton>
          </router-link>
        </div>

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
              @click="$event.stopPropagation()"
            >
              <router-link
                v-if="isManager"
                :to="{ name: 'edit-event-details', params: { id: event.id } }"
              >
                <IonIcon
                  class="edit-button"
                  name="pencil"
                />
              </router-link>
              <IonIcon
                v-if="isManager"
                class="delete-button"
                name="trash"
                @click="$event.stopPropagation(); deleteEvent(event)"
              />
            </div>
          </IonItem>
        </IonList>
        
        <div v-else>
          <IonText color="medium">
            Keine Events gefunden
          </IonText>
        </div>
        
        <IonInfiniteScroll
          threshold="100px" 
          :disabled="isDisabled"
          @ionInfinite="loadData($event)"
        >
          <IonInfiniteScrollContent
            loading-spinner="bubbles"
            loading-text="Weitere Events laden..."
          />
        </IonInfiniteScroll>
      </div>
    </IonContent>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from '@/api/model/EventDto.ts'
import { CampaignDto } from '@/api/model/CampaignDto.ts'
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonText,
  modalController,
  IonInfiniteScroll, 
  IonInfiniteScrollContent,
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import { trash, pencil, add } from 'ionicons/icons'
import ConfirmDelete from '@/components/modals/ConfirmDelete.vue'
import { userStore } from '@/store/UserStore'
import { EVENT_LIST_CHUNK_SIZE } from '@/constants'

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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonList,
    IonText,
    IonItem,
    IonLabel,
    IonIcon,
    IonContent,
    IonInfiniteScroll, 
    IonInfiniteScrollContent,
  },
  data() {
    return {
      events: [] as EventDto[],
      filteredCampaigns: userStore.getState().campaigns,
      campaigns: [] as CampaignDto[],
      messages: [] as any,
      limit: EVENT_LIST_CHUNK_SIZE as number,
      offset: 0 as number,
    }
  },
  computed: {
    isManager() {
      return userStore.isManager()
    }
  },
  watch: {
    async filteredCampaigns(newValue) {
      this.updateUserCampaign(this.filteredCampaigns)
      const response = await this.$apiClient.events.list({
        campaigns: newValue ?? undefined
      })
      this.events = response.payload.data
    }
  },
  async created() {
    this.events = await this.getEvents()
    this.getCampaigns()
  },
  methods: {
    updateUserCampaign(campaigns: number[] | null) {
      userStore.setCampaigns(campaigns)
    },
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
            this.events = this.events.filter(({id}) => id !== event.id)
          }
        })
    },
    async getEvents() {
      let response
      response = await this.$apiClient.events.list({
        campaigns: this.filteredCampaigns ?? [],
        limit: this.limit,
        offset: this.offset
      })
      return response.payload.data
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    },
    campaignsByIds(findIds: number[]): CampaignDto[] {
      return this.campaigns.filter(({id}) => findIds.includes(id))
    },
    async loadData (event: CustomScrollEvent) {
      this.offset += EVENT_LIST_CHUNK_SIZE
      const moreEvents = await this.getEvents()

      if (moreEvents.length == 0) {
        event.target.disabled = true
        return
      }

      this.events = this.events.concat(moreEvents)
      event.target.complete()
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/scss/_globals.scss';

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
</style>
