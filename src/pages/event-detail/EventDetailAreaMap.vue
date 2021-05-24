<template>
  <router-view
    name="map"
    :event-area="eventArea"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EventAreaMixin from 'src/pages/event-detail/EventDetailAreaMixin'


export default defineComponent({
  name: 'EventDetailAreaMap',
  mixins: [EventAreaMixin]
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";


label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.event-area-title {
  margin: 0.8rem 0 0 0;
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

</style>
