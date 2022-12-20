// @ts-ignore
import maplibregl from 'maplibre-gl'
import { Geometry } from 'geojson'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { OSMPlaceDto } from 'src/api/model/OSMPlaceDto'

function parseGeocodeResult(place: OSMPlaceDto) {
  const center = [place.lon, place.lat].map(parseFloat)
  return {
    type: 'Feature',
    id: place.place_id,
    text: place.display_name,
    place_name: place.display_name,
    place_type: [place.class],
    bbox: [
      place.boundingbox[2], place.boundingbox[0], place.boundingbox[3], place.boundingbox[1]
    ] as [number, number, number, number],
    center: center,
    geometry: {
      type: 'Point',
      coordinates: center
    } as Geometry,
    context: [],
    language: '',
    properties: null,
    relevance: place.importance || 1
  } as GeocodeResult
}

function parseFeatureCollection(places: OSMPlaceDto[]) {
    return {
      type: 'FeatureCollection',
      features: places.map(parseGeocodeResult)
    };
}

export async function forwardGeocode(config: any) {
    const params: Record<string, any>= {
      format: 'json',
      q: config.query,
      limit: config.limit | 5
    };
    if (config.countries) {
      params.countrycodes = config.countries.join(',')
    }
    if (config.language) {
      params['accept-language'] = config.language.join(',')
    }
    const urlParams = new URLSearchParams(Object.entries(params)).toString();
    const response = await fetch((process.env.APP_MAP_NOMINATIM as string) + 'search?' + urlParams)
    let result = []
    if(response.ok) {
      result = await response.json()
    }
    return parseFeatureCollection(result as OSMPlaceDto[])
}

export async function reverseGeocode(config: any) {
  const params = { format: 'json', lon: config.lng, lat: config.lat };
  const urlParams = new URLSearchParams(Object.entries(params)).toString();
  const response = await fetch((process.env.APP_MAP_NOMINATIM as string) + 'reverse?' + urlParams)
  let result = {}
  if(response.ok) {
    result = await response.json()
  }
  return parseGeocodeResult(result as OSMPlaceDto)
}


export async function loadImage(map: maplibregl.Map, url: string): Promise<HTMLImageElement | ImageBitmap> {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (error: any, result: any) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

export async function loadImageIfNonExistent(map: maplibregl.Map, name: string, url: string) {
  if (map.hasImage(name)) {
    return Promise.resolve(name)
  } else {
    return loadImage(map, url)
      .then((image) => {
        if (!map.hasImage(name)) {
          map.addImage(name, image)
        }
        return name
      })
  }
}
