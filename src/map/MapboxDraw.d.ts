/**
 * Thanks: https://github.com/mapbox/mapbox-gl-draw/issues/842
 * Until MapboxDraw gets proper types
 */

declare module '@mapbox/mapbox-gl-draw' {
  import { Feature, FeatureCollection, GeoJSON } from 'geojson'
  import {IControl} from 'maplibre-gl'
  import {IMapboxDrawControls} from '@mapbox/mapbox-gl-draw'

  namespace MapboxDraw {
    export interface IMapboxDrawControls {
      point?: boolean,
      line_string?: boolean,
      polygon?: boolean
      trash?: boolean,
      combine_features?: boolean,
      uncombine_features?: boolean
    }
  }

  class MapboxDraw implements IControl {

    getDefaultPosition: () => string

    constructor(options?: {
      displayControlsDefault?: boolean,
      keybindings?: boolean,
      touchEnabled?: boolean,
      boxSelect?: boolean,
      clickBuffer?: number,
      touchBuffer?: number,
      controls?: IMapboxDrawControls,
      styles?: Record<string, unknown>[],
      modes?: Record<string, unknown>,
      defaultMode?: string,
      userProperties?: boolean
    });

    public add(geojson: GeoJSON): string[]

    public get(featureId: string): Feature | undefined

    public getFeatureIdsAt(point: { x: number, y: number }): string[]

    public getSelectedIds(): string[]

    public getSelected(): FeatureCollection

    public getSelectedPoints(): FeatureCollection

    public getAll(): FeatureCollection

    public delete(ids: string | string[]): this

    public deleteAll(): this

    public set(featureCollection: FeatureCollection): string[]

    public trash(): this

    public combineFeatures(): this

    public uncombineFeatures(): this

    public getMode(): string

    public changeMode(mode: string, options?: Record<string, unknown>): this

    public setFeatureProperty(featureId: string, property: string, value: any): this

    onAdd(map: maplibregl.Map): HTMLElement

    onRemove(map: maplibregl.Map): any

  }

  export = MapboxDraw
}
