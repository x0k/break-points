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
    Math.abs(a.longitude - b.longitude) < Number.EPSILON &&
    Math.abs(a.latitude - b.latitude) < Number.EPSILON
  )
}

export const DEFAULT_LOCATION: GeoLocation = {
  longitude: 50.840812,
  latitude: 61.660729,
}

export interface BoundaryLocations {
  start?: GeoLocation
  end?: GeoLocation
}

export function insertBoundaryLocations(
  locations: GeoLocation[],
  { start, end }: BoundaryLocations
): GeoLocation[] {
  let startIdx = start ? -1 : -2
  let endIdx = end ? -1 : -2
  if (startIdx === -2 && endIdx === -2) {
    return locations
  }
  let i = 0
  let shift = 0
  while (i < locations.length && (startIdx === -1 || endIdx === -1)) {
    if (startIdx === -1 && isEqual(locations[i], start!)) {
      startIdx = i
    }
    if (endIdx === -1 && i !== startIdx && isEqual(locations[i], end!)) {
      endIdx = i
    }
    i++
  }
  if (startIdx > -1) {
    locations.splice(startIdx, 1)
    if (startIdx > endIdx) {
      shift = 1
    }
  }
  if (start) {
    locations.unshift(start)
  }
  if (endIdx > -1) {
    locations.splice(endIdx + shift, 1)
  }
  if (end) {
    locations.push(end!)
  }
  return locations
}
