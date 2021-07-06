<template>
  <QPage class="splash-page">
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
        v-if="!isLoggedIn"
        class="signin-buttons"
      >
        <QBtn
          to="/login"
          color="primary"
        >
          Anmelden
        </QBtn>

        <QBtn
          to="/register"
          outline
          flat
          class="register-button"
          color="primary"
        >
          Registrieren
        </QBtn>
      </div>
    </div>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import Geocoder from 'src/mapbox/Geocoder.vue'
import { userStore } from 'src/store/UserStore'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { QBtn, QPage } from 'quasar'

export default defineComponent({
  name: 'Splash',
  components: {
    Geocoder,
    QBtn,
    QPage
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().bbox !== null) {
      next({name: 'events'})
    } else {
      next()
    }
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
  data() {
    return {
      mapboxToken: process.env.APP_MAPBOX_TOKEN
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
  methods: {
    async locate(result: GeocodeResult) {
      this.bbox = bbox(circle([result.center[0], result.center[1]], 2)) as BBox2d
      uiStore.setBottomSheetState(BottomSheetState.COLLAPSED)
      await this.$router.push({name: 'events'})
    }
  }
})

</script>

<style lang="scss" scoped>
.splash-page {
  flex: 1;
}

.splash {
  display: flex;
  height: 100%;
  width: 100%;
  flex: 1;
  flex-direction: column;
  background: white;
  align-items: center;
}

.splash-message {
  margin: 3rem 0 0;
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
  margin: 1rem 0;
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
