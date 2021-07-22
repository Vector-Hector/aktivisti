import { defineComponent, inject, watch, onMounted, PropType, onUnmounted, h } from 'vue'
import { MapInject } from './Map.vue'
import { uuidv4 } from 'src/utils/uuid'
import { GeoJSONSource, GeoJSONSourceRaw, SymbolLayout } from 'mapbox-gl'
import { PosterDto, PosterStatus } from 'src/api/model/PosterDto'
import { loadImageIfNonExistent } from 'src/utils/mapbox'
import { FeatureCollection, Point } from 'geojson'
import { clone } from 'lodash-es'

const ABSENT_IMAGE_NAME = 'absent-icon'
const POSITIVE_IMAGE_NAME = 'positive-icon'
const NEGATIVE_IMAGE_NAME = 'negative-icon'

export default defineComponent({
  name: 'PosterMarkerLayer',
  props: {
    posters: {
      type: Array as PropType<PosterDto[]>,
      required: true
    },
    activePosterIndex: {
      type: Number as PropType<number>
    },
    editable: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['update:posters', 'posterClick'],
  setup: function (props, {emit}) {
    const uuid = uuidv4()
    const map = inject(MapInject)!

    const posterSourceId = `${uuid}-posters-source`
    const activePosterSourceId = `${uuid}-active-poster-source`

    const posterLayerId = `${uuid}-posters`
    const activePosterLayerId = `${uuid}-active-poster`

    let postersClickable = false

    const layers: string[] = []

    const iconLayout: SymbolLayout = {
      'icon-size': .4,
      'icon-image': ['case',
        ['==', ['get', 'status'], PosterStatus.ABSENT], 'absent-icon',
        ['==', ['get', 'status'], PosterStatus.DAMAGED], 'negative-icon',
        ['==', ['get', 'status'], PosterStatus.MOUNTED], 'positive-icon',
        'absent-icon'
      ],
      'icon-allow-overlap': true
    }


    const canvas = map.value.getCanvas()
    const makeFeatureCollection = (posters: PosterDto[], active: boolean): FeatureCollection<Point> => {
      return {
        type: 'FeatureCollection',
        features: posters
          .filter((poster) => !!poster.location)
          .map((poster) => {
            return {
              type: 'Feature',
              properties: {
                status: poster.status,
                opacity: (active) ? 1 : 0.5,
                id: poster.id
              },
              geometry: {
                type: 'Point',
                coordinates: [poster.location.lng, poster.location.lat]
              }
            }
          })
      }
    }

    const onMoveActivePoster = (e: any) => {
      canvas.style.cursor = 'grabbing'
      const activePoster = props.posters[props.activePosterIndex!]
      const baseCollection = makeFeatureCollection([activePoster], true)
      baseCollection.features[0].geometry.coordinates = [e.lngLat.lng, e.lngLat.lat]
      const source = (map.value.getSource(activePosterSourceId) as GeoJSONSource)
      source.setData(baseCollection)
    }

    const onUpActivePoster = (e: any) => {
      canvas.style.cursor = ''
      const posters = clone(props.posters)
      posters[props.activePosterIndex!].location = e.lngLat
      emit('update:posters', posters)
      // Unbind mouse/touch events
      map.value.off('mousemove', onMoveActivePoster)
      map.value.off('touchmove', onMoveActivePoster)
    }

    const onEnterActivePoster = () => {
      canvas.style.cursor = 'move'
    }

    const onLeaveActivePoster = () => {
      canvas.style.cursor = ''
    }

    const onMouseDownActivePoster = (e: any) => {
      e.preventDefault()

      canvas.style.cursor = 'grab'

      map.value.on('mousemove', onMoveActivePoster)
      map.value.once('mouseup', onUpActivePoster)
    }

    const onTouchStartActivePoster = (e: any) => {
      if (e.points.length !== 1) return

      e.preventDefault()

      map.value.on('touchmove', onMoveActivePoster)
      map.value.once('touchend', onUpActivePoster)
    }

    const onEnterPoster = () => {
      canvas.style.cursor = 'pointer'
    }

    const onLeavePoster = () => {
      canvas.style.cursor = ''
    }

    const onClickPoster = (e: any) => {
      const posterId = e.features?.[0]?.properties?.id
      if (posterId) {
        emit('posterClick', posterId)
      }
    }

    const activateClickablePosters = () => {
      if (!postersClickable) {
        postersClickable = true
        map.value.on('mouseenter', posterLayerId, onEnterPoster)
        map.value.on('mouseleave', posterLayerId, onLeavePoster)
        map.value.on('click', posterLayerId, onClickPoster)
      }
    }

    const deactivateClickablePosters = () => {
      postersClickable = false
      canvas.style.cursor = ''
      map.value.off('mouseenter', posterLayerId, onEnterPoster)
      map.value.off('mouseleave', posterLayerId, onLeavePoster)
      map.value.off('click', posterLayerId, onClickPoster)
    }

    onMounted(async () => {
        await Promise.all([
          loadImageIfNonExistent(map.value, ABSENT_IMAGE_NAME, '/static/icons/location-absent-128x128.png'),
          loadImageIfNonExistent(map.value, POSITIVE_IMAGE_NAME, '/static/icons/location-positive-128x128.png'),
          loadImageIfNonExistent(map.value, NEGATIVE_IMAGE_NAME, '/static/icons/location-negative-128x128.png')
        ])
        const emptySource: GeoJSONSourceRaw = {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        }
        map?.value.addSource(posterSourceId, emptySource)
        map?.value.addSource(activePosterSourceId, emptySource)

        const refreshSource = () => {
          const active = (typeof (props.activePosterIndex as any)) === 'number';
          (map.value.getSource(posterSourceId) as GeoJSONSource)?.setData(
            makeFeatureCollection(props.posters.filter((_, index) => index !== props.activePosterIndex), !active)
          )
          if (active) {
            (map.value.getSource(activePosterSourceId) as GeoJSONSource)?.setData(
              makeFeatureCollection([props.posters[props.activePosterIndex!]], true)
            )
          } else {
            (map.value.getSource(activePosterSourceId) as GeoJSONSource)?.setData(emptySource.data as FeatureCollection)
          }
        }


        watch(() => props.posters, () => {
          refreshSource()
        }, {immediate: true, deep: true})
        watch(() => props.activePosterIndex, () => {
          refreshSource()
          const active = (typeof (props.activePosterIndex as any)) === 'number'
          // If poster layer is not editable markers can stay clickable as it doesn't conflict with moving the poster
          if (!active || !props.editable) {
            activateClickablePosters()
          } else {
            deactivateClickablePosters()
          }
        }, {immediate: true})


        layers.push(
          posterLayerId
        )
        map?.value.addLayer({
          id: posterLayerId,
          type: 'symbol',
          source: posterSourceId,
          layout: iconLayout,
          paint: {
            'icon-opacity': ['get', 'opacity']
          }
        })
        layers.push(
          activePosterLayerId
        )
        map?.value.addLayer({
          id: activePosterLayerId,
          type: 'symbol',
          source: activePosterSourceId,
          layout: iconLayout,
          paint: {
            'icon-opacity': 1
          }
        })
        if (props.editable) {
          map.value.on('mouseenter', activePosterLayerId, onEnterActivePoster)
          map.value.on('mousedown', activePosterLayerId, onMouseDownActivePoster)
          map.value.on('mouseleave', activePosterLayerId, onLeaveActivePoster)
          map.value.on('touchstart', activePosterLayerId, onTouchStartActivePoster)
          map.value.on('touchmove', onMoveActivePoster)
          map.value.on('touchend', onUpActivePoster)
        }
      }
    )

    onUnmounted(() => {
      deactivateClickablePosters()
      map.value.off('mouseenter', activePosterLayerId, onEnterActivePoster)
      map.value.off('mouseleave', activePosterLayerId, onLeaveActivePoster)
      map.value.off('touchstart', activePosterLayerId, onTouchStartActivePoster)
      map.value.off('touchmove', onMoveActivePoster)
      map.value.off('touchend', onUpActivePoster)
      layers.forEach((layerId) => {
        map?.value?.removeLayer(layerId)
      })
      map?.value?.removeSource(posterSourceId)
      map?.value?.removeSource(activePosterSourceId)
    })
  },
  render() {
    return h('span')
  }
})
