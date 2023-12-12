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
  import * as RadioGroup from '@/lib/components/radio-group'
  import ComboBox from '@/lib/combo-box.svelte'
  import { Label } from '@/lib/components/label'
  import { type INotificationsService } from '@/lib/notifications'

  import { getNodeId, getNodeTitle, type PointNode } from '../core'

  export let pointType: PointType
  export let points: PointNode[]
  export let location: GeoLocation
  export let onLocationChange: (loc: GeoLocation) => void
  export let notificationsService: INotificationsService

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
  <RadioGroup.Root bind:value={pointType}>
    <div class="flex items-center gap-2">
      <RadioGroup.Item value={PointType.Location} id="radio-location" />
      <Label for="radio-location">Location on map</Label>
      <span />
      <RadioGroup.Item value={PointType.Select} id="radio-select" />
      <Label for="radio-select">Choose from my points</Label>
    </div>
  </RadioGroup.Root>
</div>

{#if pointType === PointType.Location}
  <YandexMap
    {notificationsService}
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
