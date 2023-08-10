import { OfficeGeoJsonDto } from 'src/api/model/OfficeGeoJsonDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Store } from 'src/store/Store'

interface OfficeOverviewState {
  bbox: BBox2d | null
  featureCollection: OfficeGeoJsonDto | null
}

class OfficeOverviewStore extends Store<OfficeOverviewState> {
  protected data(): OfficeOverviewState {
    return {
      bbox: null,
      featureCollection: null
    }
  }
}
export const officeOverviewStore = new OfficeOverviewStore()
