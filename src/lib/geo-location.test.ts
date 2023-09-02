import { test, expect } from 'vitest'
import { insertBoundaryLocations, type GeoLocation } from './geo-location'

test('Should correctly insert boundary locations', () => {
  const locations: GeoLocation[] = [
    { latitude: 1, longitude: 1 },
    { latitude: 2, longitude: 2 },
    { latitude: 3, longitude: 3 },
  ]
  expect(
    insertBoundaryLocations(locations, {
      start: {
        longitude: 3,
        latitude: 3,
      },
      end: {
        longitude: 1,
        latitude: 1,
      },
    })
  ).toEqual([
    { latitude: 3, longitude: 3 },
    { latitude: 2, longitude: 2 },
    { latitude: 1, longitude: 1 },
  ])
})

test('Should correctly insert boundary locations 2', () => {
  const locations: GeoLocation[] = [
    { latitude: 1, longitude: 1 },
    { latitude: 2, longitude: 2 },
    { latitude: 3, longitude: 3 },
  ]
  expect(
    insertBoundaryLocations(locations, {
      start: {
        longitude: 2,
        latitude: 2,
      },
      end: {
        longitude: 2,
        latitude: 2,
      },
    })
  ).toEqual([
    { latitude: 2, longitude: 2 },
    { latitude: 1, longitude: 1 },
    { latitude: 3, longitude: 3 },
    { latitude: 2, longitude: 2 },
  ])
})
