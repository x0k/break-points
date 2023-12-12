<script lang="ts">
  import { Folder } from 'lucide-svelte'

  export let title: string
  export let open = false
</script>

<div>
  <div class="flex items-center gap-2 w-full">
    <slot name="prepend" />
    <button class="flex items-center gap-2 w-full" on:click>
      <Folder class="min-w-[1.5rem]" />
      <span>
        {title}
      </span>
      <div class="flex-1" />
      <slot name="append" />
    </button>
  </div>
  <div class:hidden={!open}>
    <slot />
  </div>
</div>
