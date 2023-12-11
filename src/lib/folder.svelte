<script lang="ts">
  import { Folder } from 'lucide-svelte'

  export let title: string
  export let open = false
</script>

<div>
  <button class="flex gap-2 w-full" on:click>
    <slot name="prepend" />
    <Folder class="min-w-[1.5rem]" />
    <span>
      {title}
    </span>
    <div class="flex-1" />
    <slot name="append" />
  </button>
  <div class:hidden={!open}>
    <slot />
  </div>
</div>
