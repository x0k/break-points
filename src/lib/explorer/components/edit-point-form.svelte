<script lang="ts">
  import { onMount } from 'svelte'

  import { DEFAULT_LOCATION, type GeoLocation } from '@/lib/geo-location'
  import {
    type INotificationsService,
    NotificationType,
  } from '@/lib/notifications'
  import YandexMap from '@/lib/yandex-map.svelte'
  import ComboBox from '@/lib/combo-box.svelte'
  import { Label } from '@/lib/components/label'
  import { Input } from '@/lib/components/input'
  import { Button } from '@/lib/components/button'
  import { asyncDebounce } from '@/lib/debounce'

  import {
    getPlaceAddress,
    type ILocationService,
    type PlaceLocation,
    type PointNode,
  } from '../core'

  export let node: PointNode
  export let onSubmit: (node: PointNode) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let title = node.title
  let userLocation = DEFAULT_LOCATION

  const searchPlace = asyncDebounce(
    async (_: PlaceLocation[], search: string) =>
      search.length > 3
        ? await locationService.searchPlaceByAddress(search, userLocation)
        : [],
    500
  )
  let isAddressUpdateNeeded = false
  let selectedPlace = {
    location: node.location,
    address: node.address,
  }

  const updateAddress = asyncDebounce(async ({ location }: PlaceLocation) => {
    try {
      const place = await locationService.searchPlaceByLocation(location)
      // Check that locations is not changed during search
      if (selectedPlace.location === location) {
        selectedPlace.address = place.address
      }
    } catch (error) {
      notificationsService.showNotification({
        type: NotificationType.Error,
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error during address update',
      })
    } finally {
      isAddressUpdateNeeded = false
    }
  }, 500)

  $: if (isAddressUpdateNeeded) {
    updateAddress(selectedPlace)
  }

  onMount(async () => {
    if (locationService.isUserLocationAvailable) {
      try {
        userLocation = await locationService.getUserLocation()
      } catch (error) {
        console.log('Notification', notificationsService)
        notificationsService.showNotification({
          type: NotificationType.Error,
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during locate user',
        })
      }
    }
  })

  function onPositionUpdate(location: GeoLocation) {
    isAddressUpdateNeeded = true
    selectedPlace = { location, address: '' }
  }
</script>

<form
  on:submit|preventDefault={() =>
    onSubmit({ ...node, ...selectedPlace, title })}
  class="flex flex-col gap-4"
>
  <h3 class="font-bold text-lg">Edit point</h3>
  <div class="flex flex-col w-full gap-2">
    <Label for="point-name">Point name</Label>
    <Input
      type="text"
      id="point-name"
      placeholder="My point"
      bind:value={title}
      required
    />
  </div>
  <ComboBox
    class="w-full"
    contentClass="w-[calc(100%-3rem)]"
    searchPlaceholder="Search address..."
    filter={searchPlace}
    getItemId={getPlaceAddress}
    getItemLabel={getPlaceAddress}
    selected={selectedPlace}
    onSelect={(place) => {
      isAddressUpdateNeeded = false
      selectedPlace = place
    }}
  />
  <YandexMap
    {notificationsService}
    zoom={14}
    location={selectedPlace.location}
    {onPositionUpdate}
  />
  <Button type="submit" class="w-full">Save</Button>
</form>
