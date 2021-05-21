<template>
  <div class="splash">
    <h1 class="splash-message">
      Finde Aktionen in deiner Nähe
    </h1>
    <Geocoder
      class="geocoder"
      :access-token="mapboxToken"
      :countries="['de']"
      :standalone="true"
      @result="locate"
    />
    <router-link
      v-if="location !== null"
      to="/map"
    >
      <button
        class="confirm-button"
      >
        Starten
      </button>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { uiStore } from '@/store/UiStore'
import Geocoder from '@/lib/mapbox/Geocoder.vue'
import { userStore } from '@/store/UserStore'
import { GeocodeResult } from '@/types/GeocodeResult'

export default defineComponent({
  name: 'Locate',
  components: {
    Geocoder
  },
  beforeRouteEnter (to, from, next) {
    if (userStore.getState().location !== null) {
      next({ name: 'events' })
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
    location: {
      get() {
        return userStore.getState().location
      },
      set(location) {
        userStore.locate(location)
      }
    }
  },
  created() {
    uiStore.toggleNavigation(false)
  },
  methods: {
    locate(result: GeocodeResult) {
      this.location = {
        lng: result.center[0],
        lat: result.center[1]
      }
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
  align-content: center;
  align-items: center;
  background: $red;
  box-shadow: inset 0 0 25px $black;
  padding: 0 15px;
}

.splash-message {
  margin: 70px 0 0;
  text-align: center;
  color: $white;
}

.geocoder {
  margin: 40px 0 0;
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

</style>
