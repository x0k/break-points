import type { GeoLocation } from '@/lib/geo-location'

import type { IMapUrlGenerator } from '../../core'

const BASE = 'https://2gis.ru/syktyvkar/directions/points/'

export class DoubleGisMapUrlGenerator implements IMapUrlGenerator {
  generate(locations: GeoLocation[]): string {
    const points = locations
      .map((n) => `${n.longitude}%2C${n.latitude}`)
      .join('%7C')
    return `${BASE}${points}`
  }
}
