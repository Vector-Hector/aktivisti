import { Geolocation } from '@capacitor/geolocation'

export class GeolocationService {
  async getCurrentPosition() {
    const location = await Geolocation.getCurrentPosition()
    console.dir(location)
  }
}
