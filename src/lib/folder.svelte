<script lang="ts">
  import { Folder } from 'lucide-svelte'

  export let title: string
  export let open = false
</script>

<div>
  <div class="flex gap-2" on:click>
    <slot name="prepend" />
    <Folder class="min-w-[1.5rem]" />
    <span>
      {title}
    </span>
    <div class="flex-1" />
    <slot name="append" />
  </div>
  <div class:hidden={!open}>
    <slot />
  </div>
</div>
