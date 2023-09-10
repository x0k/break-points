import type { GeoLocation } from '@/lib/geo-location'

import type { IMapUrlGenerator } from '../../core'

const BASE = 'https://www.google.com/maps/dir/'

export class GoogleMapUrlGenerator implements IMapUrlGenerator {
  generate(locations: GeoLocation[]): string {
    const points = locations
      .map((location) => `${location.latitude},${location.longitude}`)
      .join('/')
    return `${BASE}${points}`
  }
}
