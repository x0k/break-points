<script lang="ts" context="module">
  export interface FormData {
    mapType: MapType
    start?: GeoLocation
    end?: GeoLocation
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import type { Selected } from 'bits-ui'

  import { DEFAULT_LOCATION, type GeoLocation } from '@/lib/geo-location'
  import { Checkbox } from '@/lib/components/checkbox'
  import { Label } from '@/lib/components/label'
  import { Button } from '@/lib/components/button'
  import * as Select from '@/lib/components/select'
  import type { INotificationsService } from '@/lib/notifications'

  import { MapType, type ILocationService, type PointNode } from '../core'

  import DynamicPoint, { PointType } from './dynamic-point.svelte'

  export let points: PointNode[]
  export let locationService: ILocationService
  export let mapType: MapType
  export let onMapTypeChange: (newMapType: MapType) => void
  export let notificationsService: INotificationsService

  export let onSubmit: (data: FormData) => void

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

  const items: Selected<MapType>[] = [
    { label: 'Yandex', value: MapType.Yandex },
    { label: '2GIS', value: MapType.DoubleGis },
    { label: 'Google', value: MapType.Google },
  ]
  $: selected = items.find((item) => item.value === mapType)

  onMount(async () => {
    try {
      const loc = await locationService.getUserLocation()
      startLocation = loc
      endLocation = loc
    } catch (error) {
      console.error(error)
    }
  })
</script>

<form
  class="flex flex-col gap-4"
  on:submit|preventDefault={() =>
    onSubmit({
      mapType,
      start: addStartPoint ? startLocation : undefined,
      end: addEndPoint ? endLocation : undefined,
    })}
>
  <h3 class="font-bold text-lg mb-2">Setup route</h3>

  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <Checkbox
        id="add-start-point"
        bind:checked={addStartPoint}
        aria-labelledby="add-start-point-label"
      />
      <Label
        id="add-start-point-label"
        for="add-start-point"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Add start point
      </Label>
    </div>

    {#if addStartPoint}
      <DynamicPoint
        {notificationsService}
        location={startLocation}
        onLocationChange={setStartLocation}
        {points}
        pointType={PointType.Location}
      />
    {/if}

    <div class="flex items-center gap-2">
      <Checkbox
        id="add-end-point"
        bind:checked={addEndPoint}
        aria-labelledby="add-end-point-label"
      />
      <Label
        id="add-end-point-label"
        for="add-end-point"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Add end point
      </Label>
    </div>

    {#if addEndPoint}
      <DynamicPoint
        {notificationsService}
        location={endLocation}
        onLocationChange={setEndLocation}
        {points}
        pointType={PointType.Select}
      />
    {/if}
  </div>
  <Button type="submit" class="w-full">Open map</Button>
  <div class="flex flex-col gap-2">
    <Label id="map-provider-label" for="map-provider">Map provider</Label>
    <Select.Root
      {items}
      {selected}
      onSelectedChange={(v) => v && onMapTypeChange(v.value)}
    >
      <Select.Trigger
        class="w-full"
        id="map-provider"
        aria-labelledby="map-provider-label"
      >
        <Select.Value placeholder="Select a map provider" />
      </Select.Trigger>
      <Select.Content>
        {#each items as item, i (item.value)}
          <Select.Item label={item.label} value={item.value}
            >{item.label}</Select.Item
          >
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</form>
