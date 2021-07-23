// @ts-ignore
import mbxClient from '@mapbox/mapbox-sdk'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import mapboxgl from 'mapbox-gl'

const baseClient = mbxClient({
  accessToken: process.env.APP_MAPBOX_TOKEN
})
export const geocodingService = mbxGeocoding(baseClient)


export async function loadImage(map: mapboxgl.Map, url: string): Promise<HTMLImageElement | ImageBitmap> {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result!)
      }
    })
  })
}

export async function loadImageIfNonExistent(map: mapboxgl.Map, name: string, url: string) {
  if (map.hasImage(name)) {
    return Promise.resolve(name)
  } else {
    return loadImage(map, url)
      .then((image) => {
        map.addImage(name, image)
        return name
      })
  }
}
