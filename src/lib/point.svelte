<script lang="ts">
  import { MapPin } from 'lucide-svelte'
  export let title: string
</script>

<div class="flex gap-2 align-baseline" on:click>
  <slot name="prepend" />
  <MapPin class="min-w-[1.5rem]" />
  <span class="truncate shrink-0 max-w-[40%]">{title}</span>
  <slot name="append" />
</div>
