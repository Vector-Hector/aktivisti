<template>
  <router-view
    name="map"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailMap',
  mixins: [EventDetailMixin],
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

label {
  text-align: left;
}

.event {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

Button {
  margin: 10px;
  background: $red;
  border: 1px solid $red;
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
