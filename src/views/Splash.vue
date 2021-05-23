<template>
  <div class="splash">
    <img
      src="../assets/logo_dielinke.png"
      class="logo-splash"
    >
    <h2 class="splash-message">
      Finde Aktionen in deiner Nähe
    </h2>
    <Geocoder
      class="geocoder"
      :access-token="mapboxToken"
      :countries="['de']"
      :standalone="true"
      @result="locate"
    />
    <div
      v-if="isLoggedIn"
      class="signin-buttons"
    >
      <router-link
        to="/login"
      >
        <IonButton>
          Anmelden
        </IonButton>
      </router-link>

      <router-link
        to="/register"
        class="register-button"
      >
        <IonButton
          fill="none"
        >
          Registrieren
        </IonButton>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BottomSheetState, uiStore } from '@/store/UiStore'
import Geocoder from '@/lib/mapbox/Geocoder.vue'
import { userStore } from '@/store/UserStore'
import { GeocodeResult } from '@/types/GeocodeResult'
import { IonButton } from '@ionic/vue'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

export default defineComponent({
  name: 'Splash',
  components: {
    Geocoder,
    IonButton
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().bbox !== null) {
      next({name: 'events'})
    } else {
      next()
    }
  },
  beforeRouteLeave(to, from, next) {
    // TODO: toggling global ui state seems to be kinda shitty, that should probably resolved by route hierarchy
    uiStore.toggleNavigation(true)
    next()
  },
  data() {
    return {
      mapboxToken: process.env.VUE_APP_MAPBOX_TOKEN
    }
  },
  computed: {
    bbox: {
      get() {
        return userStore.getState().bbox
      },
      set(bbox: BBox2d | null) {
        userStore.setBbox(bbox)
      }
    },
    isLoggedIn() {
      return userStore.getState().user
    }
  },
  created() {
    uiStore.toggleNavigation(false)
  },
  methods: {
    locate(result: GeocodeResult) {
      this.bbox = bbox(circle([result.center[0], result.center[1]], 2)) as BBox2d
      uiStore.setBottomSheetState(BottomSheetState.COLLAPSED)
      this.$router.push({ name: 'events' })
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

.splash {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  background: white;
  align-items: center;
}

.splash-message {
  margin: 4rem 0 0;
  font-size: 1.1rem;
  font-weight: bold;
  text-align: center;
}

.geocoder {
  margin: 2rem 0 0;
}

.confirm-button {
  cursor: pointer;
  margin: 15px 0 0;
  border: 1px solid $white;
  background: $red;
  color: $white;
  font-size: 1.3rem;
  padding: 0.5rem 1rem;
  box-shadow: 0 0 4px 1px $black;
}

.logo-splash {
  width: 50%;
}

.signin-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  padding-bottom: 4rem;
}

.register-button {
  margin-top: 1rem;
}

</style>
