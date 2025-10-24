import maplibregl, {
  LayerSpecification,
  GeoJSONSource,
  MapLayerEventType,
  FilterSpecification
} from 'maplibre-gl'
import { Feature, FeatureCollection, LineString, Point } from 'geojson'
import { uuidv4 } from 'src/utils/uuid'
import { range } from 'lodash-es'
import { SPIDER_FEATURE_COLOR } from 'src/constants'

const TWO_PI = Math.PI * 2

interface Options {
  circleFootSeparation: number
  animationTimeMs: number
  animationTickMs: number
  layout?: Record<string, unknown>
  paint?: LayerSpecification['paint']
  onFeatureClick?: (ev: MapLayerEventType['click'] & object) => void
}

const DEFAULT_OPTIONS: Options = {
  circleFootSeparation: 0.000008,
  animationTimeMs: 200,
  animationTickMs: 10
}

export class SpiderifyFeatures {
  public spiderId = `${uuidv4()}-spider`
  public spiderOriginId = `${uuidv4()}-spider-origin`
  public spiderOriginPointId = `${uuidv4()}-spider-origin-point`
  public spiderOriginLineId = `${uuidv4()}-spider-origin-line`
  private spiderData: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: []
  }
  private originalFilter: null | FilterSpecification = null
  private readonly options: Options = DEFAULT_OPTIONS
  private featureMapById: Record<
    string | number,
    {
      originalFeature: Feature<Point>
      spiderifiedFeature: Feature<Point>
    }
  > = {}

  constructor(
    private map: maplibregl.Map,
    private originLayer: LayerSpecification,
    features: Array<Feature<Point>>,
    optionsParam: Partial<Options> = DEFAULT_OPTIONS
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...optionsParam
    }
    for (const feature of features) {
      this.featureMapById[feature.id!] = {
        originalFeature: feature,
        spiderifiedFeature: feature
      }
    }
  }

  get renderedFeatures() {
    return Object.values(this.featureMapById).map(
      ({ spiderifiedFeature }) => spiderifiedFeature
    )
  }

  set renderedFeatures(features) {
    for (const feature of features) {
      this.featureMapById[feature.id!].spiderifiedFeature = feature
    }
  }

  get originalFeatures() {
    return Object.values(this.featureMapById).map(
      ({ originalFeature }) => originalFeature
    )
  }

  *generateCircleParams(count: number) {
    const zoomFactor = Math.pow(1 / (this.map.getZoom() / 22), 12)
    const circumference =
      this.options.circleFootSeparation * zoomFactor * (2 + count)
    const legLength = circumference / TWO_PI // = radius from circumference
    const angleStep = TWO_PI / count
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep
      yield {
        x: legLength * Math.cos(angle),
        y: legLength * Math.sin(angle),
        angle: angle,
        legLength: legLength,
        index: i
      }
    }
  }

  spiderify() {
    const mapClickListener = (e) => {
      // Check if clicked somewhere on the map where no spiderified is rendered
      // If yes: close spider
      const clickedPoints = this.map.queryRenderedFeatures(e.point, {
        layers: [this.spiderId]
      })
      if (clickedPoints.length === 0) {
        void unspiderify()
      }
    }

    // We'll listen on zoom, if the user zooms close the spider
    const zoomListener = () => {
      void unspiderify()
    }

    const unspiderify = async () => {
      // unregister eventlisteners
      this.map.off('click', mapClickListener)
      this.map.off('zoomstart', zoomListener)

      // animate the folding of the spider
      await this.animateSpider(
        this.renderedFeatures.map((feature) => ({
          feature,
          targetPoint: this.featureMapById[feature.id!].originalFeature.geometry
            .coordinates as [number, number]
        }))
      )
      // restore filter of the original points to show them agin
      this.map.setFilter(this.originLayer.id, this.originalFilter)

      // remove the spiderify layer with a little delay to avoid flicker
      setTimeout(() => {
        this.map.removeLayer(this.spiderId)
        this.map.removeLayer(this.spiderOriginLineId)
        this.map.removeSource(this.spiderId)
        this.map.removeLayer(this.spiderOriginPointId)
        this.map.removeSource(this.spiderOriginId)
      }, 50)
    }

    this.spiderData = {
      type: 'FeatureCollection',
      features: this.renderedFeatures
    }
    this.map.addSource(this.spiderId, {
      type: 'geojson',
      data: this.spiderData
    })
    this.map.addSource(this.spiderOriginId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.originalFeatures
      }
    })
    this.map.addLayer({
      id: this.spiderOriginPointId,
      type: 'circle',
      source: this.spiderOriginId,
      paint: {
        'circle-radius': 5,
        'circle-color': SPIDER_FEATURE_COLOR
      }
    })
    this.map.addLayer({
      id: this.spiderOriginLineId,
      type: 'line',
      source: this.spiderId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': SPIDER_FEATURE_COLOR,
        'line-width': 2
      }
    })
    this.map.addLayer({
      id: this.spiderId,
      type: this.originLayer.type,
      source: this.spiderId,
      layout: this.options.layout
    } as LayerSpecification)

    // calculate the spider
    const spiderParams = Array.from(
      this.generateCircleParams(this.renderedFeatures.length)
    ).map((params) => {
      const feature = this.renderedFeatures[params.index]
      const origin = feature.geometry.coordinates
      return {
        feature,
        targetPoint: [origin[0] + params.x, origin[1] + params.y] as [
          number,
          number
        ]
      }
    })

    // to avoid flicker give a little delay before hiding the underlying points and starting the spider animation
    setTimeout(() => {
      // make the features invisible in their original dataset as we'll animate them on the spiderify layer
      this.originalFilter = this.map.getFilter(this.originLayer.id) || null
      this.map.setFilter(this.originLayer.id, [
        'all',
        this.originalFilter,
        [
          '!',
          ['in', ['id'], ['literal', this.renderedFeatures.map(({ id }) => id)]]
        ]
      ] as FilterSpecification)
      void this.animateSpider(spiderParams)
    }, 20)

    // Register event listener
    this.map.on('click', mapClickListener)
    this.map.on('zoomstart', zoomListener)

    // configure click forwarding if a click callback is configured
    if (this.options.onFeatureClick) {
      this.map.on('mouseenter', this.spiderId, () => {
        this.map.getCanvas().style.cursor = 'pointer'
      })

      this.map.on('mouseleave', this.spiderId, () => {
        this.map.getCanvas().style.cursor = ''
      })
      this.map.on('click', this.spiderId, (e) =>
        this.options.onFeatureClick?.(e)
      )
    }

    return unspiderify
  }

  async animateSpider(
    spider: Array<{ feature: Feature<Point>; targetPoint: [number, number] }>
  ) {
    const ticks = range(
      0,
      this.options.animationTimeMs + this.options.animationTickMs,
      this.options.animationTickMs
    )
    return await Promise.all(
      ticks.map((tick) => {
        const tickedFeatures = spider.map(({ feature, targetPoint }) => {
          const origin = feature.geometry.coordinates as [number, number]
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: this.getAnimationTick(
                origin,
                targetPoint,
                tick / this.options.animationTimeMs
              )
            }
          }
        })
        return new Promise<void>((resolve) =>
          setTimeout(() => {
            // Generate lines from the original point to the spiderified poisition
            const tickedLines = tickedFeatures.map(
              (feature) =>
                ({
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: [
                      feature.geometry.coordinates,
                      this.featureMapById[feature.id!].originalFeature.geometry
                        .coordinates
                    ]
                  },
                  properties: {}
                }) as Feature<LineString>
            )
            ;(this.map.getSource(this.spiderId) as GeoJSONSource).setData({
              type: 'FeatureCollection',
              features: [...tickedFeatures, ...tickedLines]
            })

            this.renderedFeatures = tickedFeatures
            resolve()
          }, tick)
        )
      })
    )
  }

  private getAnimationTick(
    origin: [number, number],
    targetPoint: [number, number],
    animPercent: number
  ) {
    const targetVector = [
      targetPoint[0] - origin[0],
      targetPoint[1] - origin[1]
    ]
    return [
      origin[0] + targetVector[0] * animPercent,
      origin[1] + targetVector[1] * animPercent
    ]
  }
}
