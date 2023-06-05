<template>
  <QBtn
    v-if="visible"
    class="overlay-shadow bg-white"
    icon="img:static/icons/north.svg"
    @click="onResetClicked"
    color="black"
    flat
    round
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import { MapInject } from './Map.vue'
import { QBtn } from 'quasar'

const northIcon =
  'M 56.693359 0 L 0 66.142578 L 113.38672 66.142578 L 56.693359 0 z M 15.224609 78.716797 L 15.224609 173.89844 L 33.257812 173.89844 L 33.257812 129.10742 C 33.257812 126.63346 33.192708 123.85504 33.0625 120.77344 C 32.975694 117.64844 32.845486 114.67665 32.671875 111.85547 C 32.498264 108.55686 32.281901 105.23655 32.021484 101.89453 L 32.607422 101.89453 L 70.041016 173.89844 L 95.626953 173.89844 L 95.626953 78.716797 L 77.529297 78.716797 L 77.529297 123.76953 L 77.529297 127.41406 C 77.5727 128.75955 77.6148 130.17079 77.658203 131.64648 C 77.701606 133.07878 77.74566 134.53212 77.789062 136.00781 C 77.875868 137.44011 77.940972 138.85134 77.984375 140.24023 C 78.157986 143.45204 78.309245 146.70725 78.439453 150.00586 L 78.048828 150.00586 L 40.679688 78.716797 L 15.224609 78.716797 z '

export default defineComponent({
  name: 'ResetRotateControl',
  components: {
    QBtn
  },
  setup() {
    const map = inject(MapInject)!
    return {
      map
    }
  },
  data() {
    return {
      northIcon,
      visible: false,
      mapListener: null as null | (() => void)
    }
  },
  mounted() {
    this.mapListener = () => {
      this.visible = this.map.getBearing() !== 0 || this.map.getPitch() !== 0
    }
    this.map.on('rotateend', this.mapListener)
    this.map.on('pitchend', this.mapListener)
  },
  unmounted() {
    if (this.mapListener !== null) {
      this.map.off('rotateend', this.mapListener)
      this.map.off('pitchend', this.mapListener)
    }
  },
  methods: {
    onResetClicked() {
      this.map.setBearing(0)
      this.map.setPitch(0)
      this.visible = false
    }
  }
})
</script>
<style lang="scss" scoped></style>
