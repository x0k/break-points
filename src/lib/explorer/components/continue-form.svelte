<script lang="ts">
  import { onMount } from 'svelte'

  import {
    DEFAULT_LOCATION,
    type BoundaryLocations,
    type GeoLocation,
  } from '@/lib/geo-location'

  import type { IExplorerService, ILocationService, PointNode } from '../core'

  import DynamicPoint, { PointType } from './dynamic-point.svelte'

  export let points: PointNode[]
  export let locationService: ILocationService
  export let explorerService: IExplorerService

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
    explorerService.openMapWithSelectedPoints({
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

  <button type="submit" class="btn btn-primary w-full mt-4">Open map</button>
</form>
