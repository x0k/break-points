import type { GeoLocation } from '@/lib/geo-location'

import type { IMapUrlGenerator } from '../../core'

const BASE = 'https://yandex.com/maps/'

export class YandexMapUrlGenerator implements IMapUrlGenerator {
  generate(locations: GeoLocation[]): string {
    const points = locations
      .map((n) => `${n.latitude}%2C${n.longitude}`)
      .join('~')
    return `${BASE}?rtext=${points}&mode=routes&rtt=auto&z=11`
  }
}
