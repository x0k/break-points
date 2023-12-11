<script lang="ts">
  import { onMount } from 'svelte'
  import type { YMap, YMapListener } from '@yandex/ymaps3-types'
  import type { YMapDefaultMarker } from '@yandex/ymaps3-types/packages/markers'

  import { type GeoLocation, makeGeoLocation, toPair } from './geo-location'

  export let onPositionUpdate: (location: GeoLocation) => void
  export let location: GeoLocation
  export let zoom = 11
  let className = 'w-full h-[60vh]'
  export { className as class }

  $: loc = toPair(location)

  let mapElement: HTMLDivElement

  let map: YMap

  let marker: YMapDefaultMarker

  let listener: YMapListener

  $: if (marker) {
    marker.update({
      coordinates: loc,
    })
  }

  onMount(async () => {
    await ymaps3.ready

    map = new ymaps3.YMap(mapElement, {
      location: {
        center: loc,
        zoom,
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

    listener = new ymaps3.YMapListener({
      onClick: (obj, event) => {
        if (obj?.type !== 'marker') {
          onPositionUpdate(
            makeGeoLocation(event.coordinates[0], event.coordinates[1])
          )
        }
      },
    })

    map.addChild(listener)
  })
</script>

<div bind:this={mapElement} class={className} />
