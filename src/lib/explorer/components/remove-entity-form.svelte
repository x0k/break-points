<script lang="ts">
  import type { Readable } from 'svelte/store'

  import { Button } from '@/lib/components/button'

  import {
    type ExplorerNode,
    type ExplorerNodeId,
    NODE_TYPE_TITLES,
    getNodeById,
  } from '../core'

  export let nodeId: ExplorerNodeId
  export let nodes: Readable<ExplorerNode[]>
  export let onSubmit: (node: ExplorerNode) => void

  $: node = getNodeById($nodes, nodeId)
</script>

{#if node}
  {@const n = node}
  <form
    on:submit|preventDefault={() => onSubmit(n)}
    class="flex flex-col gap-4"
  >
    <h3 class="font-bold text-lg">Remove {NODE_TYPE_TITLES[node.type]}</h3>
    <p>You really want to delete {node.title} {NODE_TYPE_TITLES[node.type]}?</p>
    <Button variant="destructive" type="submit" class="w-full">Delete</Button>
  </form>
{:else}
  <p>Node not found</p>
{/if}
