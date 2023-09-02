<script lang="ts">
  import type { YMap } from '@yandex/ymaps3-types'
  import { onMount } from 'svelte'

  import {
    isEqual,
    type GeoLocation,
    makeGeoLocation,
    toPair,
  } from './geo-location'
  import type { YMapDefaultMarker } from '@yandex/ymaps3-types/packages/markers'

  export let onPositionUpdate: (location: GeoLocation) => void
  export let location: GeoLocation
  let className = 'w-full h-[60vh]'
  export { className as class }

  $: loc = toPair(location)

  let mapElement: HTMLDivElement

  let map: YMap

  let marker: YMapDefaultMarker

  $: if (marker) {
    marker.update({
      coordinates: loc,
    })
    setTimeout(() => {
      if (!isEqual(makeGeoLocation(map.center[0], map.center[1]), location)) {
        map.update({
          location: {
            center: loc,
          },
        })
      }
    })
  }

  onMount(async () => {
    await ymaps3.ready

    map = new ymaps3.YMap(mapElement, {
      location: {
        center: loc,
        zoom: 11,
      },
    })

    map.addChild(new ymaps3.YMapDefaultSchemeLayer({}))

    map.addChild(new ymaps3.YMapDefaultFeaturesLayer({}))

    const { YMapDefaultMarker } = await ymaps3.import(
      '@yandex/ymaps3-markers@0.0.1'
    )

    marker = new YMapDefaultMarker({
      coordinates: loc,
      draggable: true,
      mapFollowsOnDrag: true,
      onDragEnd: (coords) =>
        onPositionUpdate(makeGeoLocation(coords[0], coords[1])),
    })

    map.addChild(marker)
  })
</script>

<div bind:this={mapElement} class={className} />
