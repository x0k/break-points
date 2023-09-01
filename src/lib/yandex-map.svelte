<script lang="ts">
  import type {
    DomEvent,
    DomEventHandlerObject,
    YMap,
    YMapListener,
    YMapMarker,
  } from '@yandex/ymaps3-types'
  import { onMount } from 'svelte'
  import { MapPin } from 'lucide-svelte'

  import {
    isEqual,
    type GeoLocation,
    makeGeoLocation,
    toPair,
  } from './geo-location'

  export let onPositionUpdate: (location: GeoLocation) => void
  export let location: GeoLocation
  $: loc = toPair(location)

  let mapElement: HTMLDivElement

  let markerElement: HTMLElement

  let map: YMap

  let marker: YMapMarker

  let listener: YMapListener

  function domEventHandler(object: DomEventHandlerObject, event: DomEvent) {
    if (object?.type === 'marker') {
      onPositionUpdate({
        longitude: event.coordinates[0],
        latitude: event.coordinates[1],
      })
    }
  }

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

    // const controls = new ymaps3.YMapControls({
    //   position: 'bottom right',
    // })

    // const button = new ymaps3.YMapControlButton({
    //   text: 'Привет',
    //   onClick: () => alert('Привет Мир!'),
    // })

    // controls.addChild(button)

    // controls.addChild(new ymaps3.YMapGeolocationControl())

    // map.addChild(controls)

    map.addChild(new ymaps3.YMapDefaultFeaturesLayer({}))

    marker = new ymaps3.YMapMarker(
      {
        coordinates: loc,
        draggable: true,
        mapFollowsOnDrag: true,
      },
      markerElement
    )

    map.addChild(marker)

    listener = new ymaps3.YMapListener({
      onPointerUp: domEventHandler,
      onMouseUp: domEventHandler,
      onTouchEnd: domEventHandler,
    })

    map.addChild(listener)
  })
</script>

<div bind:this={mapElement} class="w-full h-[60vh]" />
<div bind:this={markerElement}>
  <MapPin color="red" size={32} />
</div>
