<script lang="ts">
  import type { Readable } from 'svelte/store'

  import Folder from '@/lib/folder.svelte'
  import { Checkbox } from '@/lib/components/checkbox'

  import {
    type ExplorerNode,
    type ExplorerNodeId,
    type FolderNode,
    extractPointIds,
  } from '../core'

  import Node from './node.svelte'

  export let node: FolderNode
  export let open: Readable<Set<ExplorerNodeId>>
  export let selected: Readable<Set<ExplorerNodeId>>
  export let selectNode: (node: ExplorerNode) => void
  export let openFolder: (node: FolderNode) => void

  $: isOpen = $open.has(node.id)
  $: points = extractPointIds(node)
  let isSelected: boolean | 'indeterminate'
  $: {
    if (points.length === 0 || $selected.size === 0) {
      isSelected = false
    }
    let i = 1
    let isEverySelected = $selected.has(points[0])
    while (i < points.length) {
      const isPointSelected = $selected.has(points[i])
      if (isEverySelected !== isPointSelected) {
        break
      }
      isEverySelected = isEverySelected && isPointSelected
      i++
    }
    isSelected = i === points.length ? isEverySelected : 'indeterminate'
  }
</script>

<Folder title={node.title} open={isOpen} on:click={() => openFolder(node)}>
  <svelte:fragment slot="prepend">
    {#key isSelected}
      <Checkbox
        checked={isSelected}
        disabled={points.length === 0}
        on:click={() => selectNode(node)}
      />
    {/key}
  </svelte:fragment>
  <svelte:fragment slot="append">
    <span class="font-thin">({points.length})</span>
    <slot name="append" {node} />
  </svelte:fragment>
  {#if node.children.length > 0}
    <div class="flex flex-col gap-4 pt-4 ml-4">
      {#each node.children as n (n.id)}
        <Node node={n} {open} {selected} {selectNode} {openFolder}>
          <svelte:fragment slot="append" let:node>
            <slot name="append" {node} />
          </svelte:fragment>
        </Node>
      {/each}
    </div>
  {/if}
</Folder>
