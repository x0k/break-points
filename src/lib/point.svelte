<script lang="ts">
  import { MapPin } from 'lucide-svelte'
  export let title: string
  // on:click used to bubble up event to parent
</script>

<button class="flex items-center gap-2 w-full" on:click>
  <slot name="prepend" />
  <MapPin class="min-w-[1.5rem]" />
  <span class="truncate shrink-0 max-w-[40%]">{title}</span>
  <slot name="append" />
</button>
