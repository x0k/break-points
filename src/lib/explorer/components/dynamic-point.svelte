<script context="module" lang="ts">
  export enum PointType {
    Location = 'location',
    Select = 'select',
  }
</script>

<script lang="ts">
  import { matchSorter } from 'match-sorter'

  import YandexMap from '@/lib/yandex-map.svelte'
  import { isEqual, type GeoLocation } from '@/lib/geo-location'
  import ComboBox from '@/lib/combo-box.svelte';

  import { getNodeId, getNodeTitle, type PointNode } from '../core'

  export let pointType: PointType
  export let points: PointNode[]
  export let location: GeoLocation
  export let onLocationChange: (loc: GeoLocation) => void

  const groupId = Date.now().toString(16)

  let selected = points[0]

  function filter(points: PointNode[], search: string) {
    return matchSorter(points, search, { keys: ['title', 'address'] })
  }

  function onSelect(point: PointNode) {
    selected = point
    onLocationChange(selected.location)
  }

  function getNewLocation(pt: PointType): GeoLocation {
    switch (pt) {
      case PointType.Location:
        return location
      case PointType.Select:
        return selected.location
      default:
        throw new Error(`Unknown point type ${pt}`)
    }
  }

  function updateLocation() {
    const loc = getNewLocation(pointType)
    if (!isEqual(location, loc)) {
      onLocationChange(loc)
    }
  }
</script>

<div class="flex flex-row gap-4" on:change={updateLocation}>
  <div class="form-control">
    <label class="label cursor-pointer gap-2">
      <input
        bind:group={pointType}
        on:change
        type="radio"
        name="point-type-{groupId}"
        class="radio"
        value={PointType.Location}
      />
      <span class="label-text">Location</span>
    </label>
  </div>
  <div class="form-control">
    <label class="label cursor-pointer gap-2">
      <input
        bind:group={pointType}
        on:change
        type="radio"
        name="point-type-{groupId}"
        class="radio"
        value={PointType.Select}
      />
      <span class="label-text">Select point</span>
    </label>
  </div>
</div>

{#if pointType === PointType.Location}
  <YandexMap
    {location}
    onPositionUpdate={onLocationChange}
    class="w-full h-[40vh]"
  />
{:else}
  <ComboBox
    class="w-full"
    contentClass="w-[calc(100%-3rem)]"
    items={points}
    {filter}
    getItemId={getNodeId}
    getItemLabel={getNodeTitle}
    {selected}
    {onSelect}
  />
{/if}
