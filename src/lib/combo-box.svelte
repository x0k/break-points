<script lang="ts" generics="T">
  import { tick } from 'svelte'
  import { Check, ChevronsUpDown } from 'lucide-svelte'

  import * as Command from '@/lib/components/command'
  import * as Popover from '@/lib/components/popover'
  import { Button } from '@/lib/components/button'
  import { cn } from '@/lib/utils'

  export let items: T[] = []
  export let selected: T | null
  export let defaultLabel = 'Select an item'
  export let searchPlaceholder = 'Search items'
  export let getItemLabel: (item: T) => string
  export let getItemId: (item: T) => string
  export let filter: (items: T[], search: string) => T[] | Promise<T[]>
  export let onSelect: (item: T) => void
  let className = ''
  export { className as class }
  export let contentClass = ''

  let open = false
  let search = ''

  $: selectedItemId = selected && getItemId(selected)
  $: selectedItemLabel =
    selected === null ? defaultLabel : getItemLabel(selected)
  $: filtered = filter(items, search)
  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false
    search = ''
    tick().then(() => {
      document.getElementById(triggerId)?.focus()
    })
  }
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      class={cn('w-[200px] justify-between', className)}
    >
      <span class="truncate">
        {selectedItemLabel}
      </span>
      <ChevronsUpDown class="ml-auto h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class={cn('w-[200px] p-0', contentClass)}>
    <Command.Root shouldFilter={false}>
      <Command.Input placeholder={searchPlaceholder} bind:value={search} />
      <Command.Empty>
        <slot name="no-results">Nothing found</slot>
      </Command.Empty>
      <Command.Group>
        {#await filtered}
          <Command.Item disabled>Loading...</Command.Item>
        {:then items}
          {#each items as item, _ (getItemId(item))}
            {@const id = getItemId(item)}
            <Command.Item
              value={id}
              onSelect={() => {
                onSelect(item)
                closeAndFocusTrigger(ids.trigger)
              }}
            >
              <Check
                class={cn(
                  'mr-2 h-4 w-4',
                  selectedItemId !== id && 'text-transparent'
                )}
              />
              {getItemLabel(item)}
            </Command.Item>
          {/each}
        {/await}
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
