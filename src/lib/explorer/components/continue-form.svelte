<script lang="ts">
  import { onMount } from 'svelte'

  import { DEFAULT_LOCATION, type GeoLocation } from '@/lib/geo-location'

  import {
    MapType,
    type IExplorerService,
    type ILocationService,
    type PointNode,
    isMapType,
  } from '../core'

  import DynamicPoint, { PointType } from './dynamic-point.svelte'

  export let points: PointNode[]
  export let locationService: ILocationService
  export let explorerService: IExplorerService
  export let mapType: MapType
  export let onMapTypeChange: (newMapType: MapType) => void

  let addStartPoint = true
  let startLocation = DEFAULT_LOCATION
  function setStartLocation(loc: GeoLocation) {
    startLocation = loc
  }

  let addEndPoint = false
  let endLocation = DEFAULT_LOCATION
  function setEndLocation(loc: GeoLocation) {
    endLocation = loc
  }

  onMount(async () => {
    try {
      const loc = await locationService.getUserLocation()
      startLocation = loc
      endLocation = loc
    } catch (error) {
      console.error(error)
    }
  })

  function onSubmit() {
    explorerService.openMapWithSelectedPoints(mapType, {
      start: addStartPoint ? startLocation : undefined,
      end: addEndPoint ? endLocation : undefined,
    })
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <h3 class="font-bold text-lg mb-4">Setup route</h3>

  <div class="flex flex-col gap-4">
    <div class="form-control">
      <label class="cursor-pointer flex flex-row gap-2 items-center">
        <input type="checkbox" class="checkbox" bind:checked={addStartPoint} />
        <span class="label-text font-bold">Add start point</span>
      </label>
    </div>

    {#if addStartPoint}
      <DynamicPoint
        location={startLocation}
        onLocationChange={setStartLocation}
        {points}
        pointType={PointType.Location}
      />
    {/if}

    <div class="form-control">
      <label class="cursor-pointer flex flex-row gap-2 items-center">
        <input type="checkbox" class="checkbox" bind:checked={addEndPoint} />
        <span class="label-text font-bold">Add end point</span>
      </label>
    </div>

    {#if addEndPoint}
      <DynamicPoint
        location={endLocation}
        onLocationChange={setEndLocation}
        {points}
        pointType={PointType.Select}
      />
    {/if}
  </div>
  <div class="join mt-4 w-full">
    <select
      class="select select-primary join-item"
      placeholder="Map provider"
      value={mapType}
      on:change={(e) => {
        const { value } = e.currentTarget
        if (isMapType(value)) {
          onMapTypeChange(value)
        }
      }}
    >
      <option value={MapType.Yandex}>Yandex</option>
      <option value={MapType.DoubleGis}>2GIS</option>
      <option value={MapType.Google}>Google</option>
    </select>
    <button type="submit" class="join-item btn btn-primary grow"
      >Open map</button
    >
  </div>
</form>
