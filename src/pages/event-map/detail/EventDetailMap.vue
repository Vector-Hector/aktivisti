<template>
  <router-view
    name="map"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailMap',
  mixins: [EventDetailMixin]
})

</script>

<style lang="scss" scoped>
label {
  text-align: left;
}

.event {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

.campaign {
  font-weight: bold;
  display: block;
}

.full-width {
  width: 100%;
}

.event-name {
  margin: 0 0 1rem 0;
}

.chevron {
  margin-left: 2rem;
  font-size: 2rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.content {
  flex: 1
}

.map-container {
  flex: 1;
  display: flex;
}


</style>
