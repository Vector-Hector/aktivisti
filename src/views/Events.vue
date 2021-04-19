<template>
  <IonContent>
    <div class="container">
      <h2>Events</h2>
      <div class="autocomplete">
        <IonSelect
          v-model="filteredCampaigns"
          :multiple="true"
          placeholder="Alle Kampagnen"
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
            <p>{{ campaignById(event.campaign)?.name }}</p>
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
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from '@/api/model/EventDto.ts'
import { CampaignDto } from '@/api/model/CampaignDto.ts'
import {
  IonButton, IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonText,
  modalController
} from '@ionic/vue'
import { addIcons } from 'ionicons'
import { trash, pencil, add } from 'ionicons/icons'
import ConfirmDelete from '@/components/modals/ConfirmDelete.vue'
import { userStore } from '@/store/UserStore'

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
  },
  data() {
    return {
      events: [] as EventDto[],
      filteredCampaigns: [] as CampaignDto[],
      campaigns: [] as CampaignDto[]
    }
  },
  computed: {
    isManager() {
      return userStore.isManager()
    }
  },
  watch: {
    async filteredCampaigns(newValue) {
      const response = await this.$apiClient.events.list({
        campaign: newValue ?? undefined
      })
      this.events = response.payload.data
    }
  },
  created() {
    this.getEvents()
    this.getCampaigns()
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
              // TODO show message to user: This event couldn't be deleted...
              return
            }
            this.events = this.events.filter(({id}) => id !== event.id)
          }
        })
    },
    async getEvents() {
      const response = await this.$apiClient.events.list()
      this.events = response.payload.data
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    },
    searchCampaign(event: any) {
      if (!event.query.trim().length) {
        this.filteredCampaigns = [...this.campaigns]
      } else {
        this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
          return campaign.name.toLowerCase().startsWith(event.query.toLowerCase())
        })
      }
    },
    campaignById(findId: number): CampaignDto | undefined {
      return this.campaigns.find(({id}) => id === findId)
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
