// @ts-ignore
import maplibregl from 'maplibre-gl'
import { Geometry } from 'geojson'
import { GeocodeResult } from 'src/types/GeocodeResult'

function getGeocodeResult(obj: any) {
  const center = [obj.lon, obj.lat].map(n => parseFloat(n))
  return {
    type: 'Feature',
    id: obj.place_id,
    text: obj.display_name,
    place_name: obj.display_name,
    place_type: [obj.class],
    bbox: [
      obj.boundingbox[2], obj.boundingbox[0], obj.boundingbox[3], obj.boundingbox[1]
    ] as [number, number, number, number],
    center: center,
    geometry: {
      type: 'Point',
      coordinates: center
    } as Geometry,
    context: [],
    language: '',
    properties: null,
    relevance: obj.importance || 1
  } as GeocodeResult
}

function getFeatureCollection(list: any) {
    return {
      type: 'FeatureCollection',
      features: list.map(getGeocodeResult)
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
    return fetch((process.env.APP_MAP_NOMINATIM as string) + 'search?' + urlParams).then(function(response) {
      if(response.ok) {
        return response.json();
      } else {
        return [];
      }
    }).then(getFeatureCollection)
}

export async function reverseGeocode(config: any) {
  const params = { format: 'json', lon: config.lon, lat: config.lat };
  const urlParams = new URLSearchParams(Object.entries(params)).toString();
  return fetch((process.env.APP_MAP_NOMINATIM as string) + 'reverse?' + urlParams).then(function(response) {
    if(response.ok) {
      return response.json();
    } else {
      return {};
    }
  }).then(getGeocodeResult)
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
