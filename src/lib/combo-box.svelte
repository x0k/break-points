<script lang="ts" generics="T">
  import { createCombobox } from 'svelte-headlessui'
  import Transition from 'svelte-transition'

  export let items: T[]
  export let selected: T
  export let getItemLabel: (item: T) => string
  export let getItemId: (item: T) => string | number
  export let filter: (items: T[], search: string) => T[]
  export let onSelect: (item: T) => void

  const combobox = createCombobox({ label: 'Actions', selected })
  let key = 0

  function handleSelect(e: Event) {
    const { detail } = e as CustomEvent
    if (detail && 'selected' in detail) {
      onSelect(detail.selected)
    }
  }

  $: filtered = filter(items, $combobox.filter)
</script>

<div>
  {#key key}
    <input
      use:combobox.input
      on:click={combobox.open}
      on:select={handleSelect}
      class="input input-bordered w-full"
      value={getItemLabel($combobox.selected)}
    />
  {/key}

  <Transition
    show={$combobox.expanded}
    leave="transition ease-in duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    on:after-leave={() => {
      combobox.reset()
      key++
    }}
  >
    <ul
      use:combobox.items
      class="absolute shadow menu z-[1] bg-base-100 rounded-box w-full max-w-[29rem]"
    >
      {#each filtered as value (getItemId(value))}
        {@const active = $combobox.active === value}
        {@const selected = $combobox.selected === value}
        <li use:combobox.item={{ value }}>
          <a class:active class:font-bold={selected} class="truncate">
            {getItemLabel(value)}
          </a>
        </li>
      {:else}
        <li>
          <a class="disabled truncate">Nothing found</a>
        </li>
      {/each}
    </ul>
  </Transition>
</div>
