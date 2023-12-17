<script context="module" lang="ts">
  export enum PointType {
    Location = 'location',
    Select = 'select',
  }

  function makeUserPointNode(place: PlaceLocation): PointNode {
    return {
      ...place,
      id: 'user-location',
      type: NodeType.Point,
      title: 'User location',
    }
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
  import { asyncDebounce } from '@/lib/debounce'

  import {
    getNodeId,
    getNodeTitle,
    getPlaceAddress,
    NodeType,
    type ILocationService,
    type PlaceLocation,
    type PointNode,
  } from '../core'

  export let id: string
  export let pointType: PointType
  export let points: PointNode[]
  export let location: GeoLocation
  export let onLocationChange: (loc: GeoLocation) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  $: userPoint = makeUserPointNode({
    location: location,
    address: 'User location',
  })
  $: pointsWithUserLocation = points.concat(userPoint)

  let selected = userPoint
  let isLocationUpdated = false
  $: if (!selected || !isEqual(userPoint.location, selected.location)) {
    if (isLocationUpdated) {
      isLocationUpdated = false
    } else {
      selected = userPoint
    }
  }

  const searchPlace = asyncDebounce(
    async (_: PlaceLocation[], search: string) =>
      search.length > 3
        ? await locationService.searchPlaceByAddress(search, location)
        : [],
    1000
  )

  function filter(points: PointNode[], search: string) {
    return matchSorter(points, search, { keys: ['title', 'address'] })
  }
  function onSelect(point: PointNode | PlaceLocation) {
    selected = 'id' in point ? point : makeUserPointNode(point)
    isLocationUpdated = true
    onLocationChange(selected.location)
  }
</script>

<div class="flex flex-row gap-4">
  <RadioGroup.Root bind:value={pointType}>
    <div class="flex items-center gap-2">
      <RadioGroup.Item value={PointType.Location} id="{id}-radio-location" />
      <Label for="{id}-radio-location">Location on map</Label>
      <span />
      <RadioGroup.Item value={PointType.Select} id="{id}-radio-select" />
      <Label for="{id}-radio-select">Choose from my points</Label>
    </div>
  </RadioGroup.Root>
</div>

{#if pointType === PointType.Location}
  <ComboBox
    class="flex-row-reverse"
    direction="rtl"
    contentClass="w-[calc(100%-3rem)]"
    searchPlaceholder="Search address..."
    filter={searchPlace}
    getItemId={getPlaceAddress}
    getItemLabel={getPlaceAddress}
    {selected}
    {onSelect}
  />
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
    items={pointsWithUserLocation}
    {filter}
    getItemId={getNodeId}
    getItemLabel={getNodeTitle}
    {selected}
    {onSelect}
  />
{/if}
