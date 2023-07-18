import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { polygon } from '@turf/turf'

export function polygonFromBBox(bbox: BBox2d) {
  const west = Number(bbox[0])
  const south = Number(bbox[1])
  const east = Number(bbox[2])
  const north = Number(bbox[3])

  const lowLeft = [west, south]
  const topLeft = [west, north]
  const topRight = [east, north]
  const lowRight = [east, south]
  return polygon(
    [[lowLeft, lowRight, topRight, topLeft, lowLeft]],
    {},
    { bbox: bbox }
  )
}
