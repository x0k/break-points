<script lang="ts">
  import { onMount } from 'svelte'
  import { derived, writable } from 'svelte/store'

  import type { GeoLocation } from '@/lib/geo-location'
  import {
    NotificationType,
    type INotificationsService,
  } from '@/lib/notifications'
  import YandexMap from '@/lib/yandex-map.svelte'

  import {
    NodeType,
    type ExplorerNodeId,
    type CreateNode,
    type ILocationService,
    type PlaceLocation,
  } from '../core'

  export let parentId: ExplorerNodeId | null = null
  export let onSubmit: (data: CreateNode) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let title: string
  let nodeType = NodeType.Folder
  let search = writable('')
  let userLocation: GeoLocation = {
    longitude: 50.840812,
    latitude: 61.660729,
  }
  $: location = userLocation
  let isLocationUpdatedBySearch = false
  let address = ''
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
  on:submit|preventDefault={(e) => {
    onSubmit({
      title,
      parentId,
      location,
      type: nodeType,
      address,
    })
    e.currentTarget.reset()
    nodeType = NodeType.Folder
  }}
>
  <h3 class="font-bold text-lg">Create entity</h3>

  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Folder</span>
      <input
        bind:group={nodeType}
        type="radio"
        name="node-type"
        class="radio"
        value={NodeType.Folder}
      />
    </label>
  </div>
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Point</span>
      <input
        bind:group={nodeType}
        type="radio"
        name="node-type"
        class="radio"
        value={NodeType.Point}
      />
    </label>
  </div>
  {#if nodeType === NodeType.Folder}
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Folder name</span>
      </label>
      <input
        type="text"
        class="mt-2 input input-bordered w-full"
        required
        bind:value={title}
      />
    </div>
  {:else}
    <div class="form-control w-full pb-2 dropdown dropdown-bottom">
      <label class="label">
        <span class="label-text">Search</span>
      </label>
      <input
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
          {#each $suggestions as s}
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
    <YandexMap {location} {onPositionUpdate} />
    <p class="pt-2">Address: {address}</p>
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Point name</span>
      </label>
      <input
        bind:this={pointTitleElement}
        type="text"
        class="mt-2 input input-bordered w-full"
        required
        bind:value={title}
      />
    </div>
  {/if}
  <div class="modal-action">
    <button type="submit" class="btn btn-primary">Create</button>
  </div>
</form>
