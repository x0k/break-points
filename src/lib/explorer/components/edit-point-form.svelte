<script lang="ts">
  import { onMount } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import { DEFAULT_LOCATION, type GeoLocation } from '@/lib/geo-location'
  import {
    type INotificationsService,
    NotificationType,
  } from '@/lib/notifications'
  import YandexMap from '@/lib/yandex-map.svelte'

  import type { ILocationService, PlaceLocation, PointNode } from '../core'

  export let node: PointNode
  export let onSubmit: (node: PointNode) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let title = node.title
  let search = writable('')
  let userLocation = DEFAULT_LOCATION
  let location = node.location
  let isLocationUpdatedBySearch = false
  let address = node.address
  let pointTitleElement: HTMLInputElement

  // TODO: Should be debounced
  async function updateAddress(loc: GeoLocation) {
    try {
      const place = await locationService.searchPlaceByLocation(loc)
      address = place.address
    } catch (error) {
      notificationsService.showNotification({
        type: NotificationType.Error,
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error during address update',
      })
    }
  }

  $: if (!isLocationUpdatedBySearch) {
    updateAddress(location)
  }

  let suggestions = derived(
    search,
    (addr, set) => {
      let id: NodeJS.Timeout
      if (addr.length > 3) {
        id = setTimeout(
          async () =>
            set(await locationService.searchPlaceByAddress(addr, userLocation)),
          400
        )
      }
      return () => clearTimeout(id)
    },
    [] as PlaceLocation[]
  )

  onMount(async () => {
    if (locationService.isUserLocationAvailable) {
      try {
        userLocation = await locationService.getUserLocation()
      } catch (error) {
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

  function onPositionUpdate(loc: GeoLocation) {
    isLocationUpdatedBySearch = false
    location = loc
  }
</script>

<form
  on:submit|preventDefault={() =>
    onSubmit({ ...node, title, address, location })}
  class="flex flex-col gap-2"
>
  <h3 class="font-bold text-lg">Edit point</h3>
  <div class="form-control w-full">
    <input
      bind:this={pointTitleElement}
      placeholder="Point name"
      type="text"
      class="mt-2 input input-bordered w-full"
      required
      bind:value={title}
    />
  </div>
  <div class="form-control w-full pb-2 dropdown dropdown-bottom">
    <input
      placeholder="Search by address"
      tabindex="0"
      type="text"
      class="mt-2 input input-bordered w-full"
      bind:value={$search}
    />
    {#if $suggestions.length > 0}
      <ul
        tabindex="0"
        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box max-w-[28rem] w-full text-ellipsis"
      >
        {#each $suggestions as s (s.address)}
          <li>
            <a
              on:click={() => {
                isLocationUpdatedBySearch = true
                address = s.address
                location = s.location
                if (pointTitleElement) {
                  pointTitleElement.focus()
                }
              }}>{s.address}</a
            >
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <YandexMap {notificationsService} zoom={14} {location} {onPositionUpdate} />
  <p>Address: {address}</p>
  <div class="modal-action">
    <button type="submit" class="btn btn-primary">Save</button>
  </div>
</form>
