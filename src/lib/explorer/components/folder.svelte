<script lang="ts">
  import type { Readable } from 'svelte/store'

  import Folder from '@/lib/folder.svelte'

  import Node from './node.svelte'

  import type { ExplorerNode, ExplorerNodeId, FolderNode } from '../core'
  import { extractPointIds } from '../core'

  export let node: FolderNode
  export let open: Readable<Set<ExplorerNodeId>>
  export let selected: Readable<Set<ExplorerNodeId>>
  export let selectNode: (node: ExplorerNode) => void
  export let openFolder: (node: FolderNode) => void

  $: isOpen = $open.has(node.id)
  $: points = extractPointIds(node)
  $: isSelected = points.length > 0 && points.every((id) => $selected.has(id))
  $: indeterminate = !isSelected && points.some((id) => $selected.has(id))
</script>

<Folder title={node.title} open={isOpen} on:click={() => openFolder(node)}>
  <svelte:fragment slot="prepend">
    {#key `${isSelected}${indeterminate}`}
      <input
        type="checkbox"
        class="checkbox"
        checked={isSelected}
        {indeterminate}
        on:click|preventDefault|stopPropagation={() => selectNode(node)}
        disabled={points.length === 0}
      />
    {/key}
  </svelte:fragment>
  <svelte:fragment slot="append">
    <span class="font-thin">({points.length})</span>
    <slot name="append" {node} />
  </svelte:fragment>
  {#if node.children.length > 0}
    <div class="flex flex-col gap-4 pt-4 ml-4">
      {#each node.children as n}
        <Node node={n} {open} {selected} {selectNode} {openFolder}>
          <svelte:fragment slot="append" let:node>
            <slot name="append" {node} />
          </svelte:fragment>
        </Node>
      {/each}
    </div>
  {/if}
</Folder>
