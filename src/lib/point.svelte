<script lang="ts">
  import { MapPin } from 'lucide-svelte'
  export let title: string
</script>

<div class="flex gap-2 align-baseline" on:click>
  <slot name="prepend" />
  <MapPin /><span>{title}</span>
  <span class="flex-1" />
  <slot name="append" />
</div>
