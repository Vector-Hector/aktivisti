// @ts-ignore
import mbxClient from '@mapbox/mapbox-sdk'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const baseClient = mbxClient({
  accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
});
export const geocodingService = mbxGeocoding(baseClient);
