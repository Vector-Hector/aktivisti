<script lang="ts">
import { defineComponent, inject, onUnmounted, PropType, watch } from 'vue'
import MapboxDraw, { IMapboxDrawControls } from '@mapbox/mapbox-gl-draw'
import { MapInject } from './Map.vue'
import { Feature } from 'geojson'
import { difference, isEqual } from 'lodash-es'

type ForwardedEvents = 'draw:create' | 'draw:update' | 'draw:delete'

export default defineComponent({
  name: 'DrawControl',
  props: {
    controls: {
      type: Object as PropType<IMapboxDrawControls>,
      required: false,
      default: {}
    },
    displayControlsDefault: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    features: {
      type: Array as PropType<Feature[]>,
      default: () => []
    },
    styles: {
      type: Array as PropType<any[] | undefined>,
      default: undefined
    }
  },
  emits: ['update:features', 'draw:create', 'draw:update', 'draw:delete', 'draw:selectionchange'],
  setup(props, {emit}) {
    const map = inject(MapInject)!
    const drawControl = new MapboxDraw({
      userProperties: true,
      controls: props.controls,
      displayControlsDefault: props.displayControlsDefault,
      styles: props.styles
    })

    map.value.addControl(drawControl, 'top-right')

    watch(() => props.features, (newFeatures) => {
      for (const feature of newFeatures) {
        const existentFeature = drawControl.get(feature.id as string)
        if (!isEqual(feature, existentFeature)) {
          drawControl.add(feature)
          // invoke this function to indicate feature change
          drawControl.setFeatureProperty(feature.id as string, 'changed', true)
        }
      }
      // determine deleted features
      const idsToDelete = difference(drawControl.getAll().features.map(({id}) => id), newFeatures.map(({id}) => id))
      drawControl.delete(idsToDelete as string[])
    })


    const forwardEventAndUpdateFeatures = (eventName: ForwardedEvents, event: any) => {
      emit(eventName, event)
      emit('update:features', drawControl.getAll().features)
    }
    map!.value
      .on('draw.create', (event) => forwardEventAndUpdateFeatures('draw:create', event))
      .on('draw.delete', (event) => forwardEventAndUpdateFeatures('draw:delete', event))
      .on('draw.update', (event) => forwardEventAndUpdateFeatures('draw:update', event))
      .on('draw.selectionchange', (event) => emit('draw:selectionchange', event))

    onUnmounted(() => {
      map?.value?.removeControl(drawControl)
    })
    return {
      changeMode: (mode: string) => { drawControl.changeMode(mode) }
    }
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_variables.scss";

.marker-icon {
  background-image: url("~@/assets/marker.png");
  background-size: cover;
  display: block;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
