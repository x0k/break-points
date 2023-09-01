export interface GeoLocation {
  longitude: number
  latitude: number
}

export function toPair(loc: GeoLocation): [number, number] {
  return [loc.longitude, loc.latitude]
}

export function makeGeoLocation(
  longitude: number,
  latitude: number
): GeoLocation {
  return {
    longitude,
    latitude,
  }
}

export function isEqual(a: GeoLocation, b: GeoLocation): boolean {
  return (
    a.longitude - b.longitude < Number.EPSILON &&
    a.latitude - b.latitude < Number.EPSILON
  )
}
