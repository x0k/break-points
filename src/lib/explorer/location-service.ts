import type { GeoLocation } from '@/lib/geo-location'
import type { ResponseFeature, YandexGeocodeAPI } from '@/lib/yandex-geocode-api'

import type { ILocationService, PlaceLocation } from './core'

function decodeGeolocationError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'User denied the request for Geolocation.'
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable.'
    case error.TIMEOUT:
      return 'The request to get user location timed out.'
    default:
      return 'An unknown error occurred.'
  }
}

function featureToPlace(feature: ResponseFeature): PlaceLocation {
  const position = feature.GeoObject.Point.pos.split(' ').map(Number)
  return {
    address:
      feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.formatted,
    location: {
      longitude: position[0],
      latitude: position[1],
    },
  }
}

export class LocationService implements ILocationService {
  constructor(private readonly geocodeService: YandexGeocodeAPI) {}

  get isUserLocationAvailable(): boolean {
    return Boolean(navigator.geolocation)
  }

  getUserLocation = async (): Promise<GeoLocation> => {
    if (!this.isUserLocationAvailable) {
      return Promise.reject(
        new Error('Geolocation is not supported by this browser')
      )
    }
    return new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        (p) =>
          resolve({
            longitude: p.coords.longitude,
            latitude: p.coords.latitude,
          }),
        (e) => reject(new Error(decodeGeolocationError(e)))
      )
    )
  }

  searchPlaceByAddress = async (
    address: string,
    near?: GeoLocation
  ): Promise<PlaceLocation[]> => {
    const data = await this.geocodeService.searchByAddress({
      address,
      searchLocationCenter: near,
    })
    return data.response.GeoObjectCollection.featureMember.map(featureToPlace)
  }

  searchPlaceByLocation = async (
    location: GeoLocation
  ): Promise<PlaceLocation> => {
    const data = await this.geocodeService.searchByLocation({
      location,
    })
    if (data.response.GeoObjectCollection.featureMember.length === 0) {
      throw new Error('No places found')
    }
    return featureToPlace(data.response.GeoObjectCollection.featureMember[0])
  }
}
