<script lang="ts">
  import { onMount } from 'svelte'

  import * as RadioGroup from '@/lib/components/radio-group'
  import { Label } from '@/lib/components/label'
  import { Input } from '@/lib/components/input'
  import { Button } from '@/lib/components/button'
  import { DEFAULT_LOCATION, type GeoLocation } from '@/lib/geo-location'
  import {
    NotificationType,
    type INotificationsService,
  } from '@/lib/notifications'
  import YandexMap from '@/lib/yandex-map.svelte'
  import ComboBox from '@/lib/combo-box.svelte'
  import { asyncDebounce } from '@/lib/debounce'

  import {
    NodeType,
    type ExplorerNodeId,
    type PlaceLocation,
    type ILocationService,
    type CreateNode,
    getPlaceAddress,
  } from '../core'

  export let parentId: ExplorerNodeId | null = null
  export let onSubmit: (data: CreateNode) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let title: string
  let nodeType = NodeType.Point
  let userLocation: GeoLocation = DEFAULT_LOCATION
  let userAddress = ''

  const searchPlace = asyncDebounce(
    async (_: PlaceLocation[], search: string) =>
      search.length > 3
        ? await locationService.searchPlaceByAddress(search, userLocation)
        : [],
    500
  )
  let isAddressUpdateNeeded = false
  $: selectedPlace = {
    location: userLocation,
    address: userAddress,
  }

  const updateAddress = asyncDebounce(async ({ location }: PlaceLocation) => {
    try {
      const place = await locationService.searchPlaceByLocation(location)
      if (selectedPlace?.location === location) {
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

  $: if (selectedPlace && isAddressUpdateNeeded) {
    updateAddress(selectedPlace)
  }

  onMount(async () => {
    if (locationService.isUserLocationAvailable) {
      try {
        userLocation = await locationService.getUserLocation()
        const userPlace =
          await locationService.searchPlaceByLocation(userLocation)
        userAddress = userPlace.address
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

  function resetForm() {
    title = ''
    nodeType = NodeType.Point
    isAddressUpdateNeeded = false
    selectedPlace = {
      location: userLocation,
      address: userAddress,
    }
  }
</script>

<form
  class="flex flex-col gap-4 min-w-0"
  on:submit|preventDefault={() => {
    if (nodeType === NodeType.Point) {
      if (!selectedPlace) {
        notificationsService.showNotification({
          type: NotificationType.Error,
          message: 'Point location is required',
        })
        return
      }
      onSubmit({
        title,
        parentId,
        type: nodeType,
        place: selectedPlace,
      })
    } else if (nodeType === NodeType.Folder) {
      onSubmit({
        title,
        parentId,
        type: nodeType,
      })
    }
    resetForm()
  }}
>
  <h3 class="font-bold text-lg">Create entity</h3>

  <RadioGroup.Root bind:value={nodeType}>
    <div class="flex items-center gap-2">
      <RadioGroup.Item value={NodeType.Point} id="radio-point" />
      <Label for="radio-point">Point</Label>
      <span />
      <RadioGroup.Item value={NodeType.Folder} id="radio-folder" />
      <Label for="radio-folder">Folder</Label>
    </div>
  </RadioGroup.Root>

  {#if nodeType === NodeType.Folder}
    <div class="flex flex-col w-full gap-2">
      <Label for="folder-name">Folder name</Label>
      <Input
        type="text"
        id="folder-name"
        placeholder="My folder"
        bind:value={title}
      />
    </div>
  {:else}
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
      location={selectedPlace?.location ?? userLocation}
      {onPositionUpdate}
    />
  {/if}
  <Button class="w-full" type="submit">Create</Button>
</form>
