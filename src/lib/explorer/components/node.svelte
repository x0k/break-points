<script lang="ts">
  import type { Readable } from 'svelte/store'

  import {
    type ExplorerNode,
    type ExplorerNodeId,
    type FolderNode,
    isFolder,
  } from '../core'

  import Folder from './folder.svelte'
  import Point from './point.svelte'

  export let node: ExplorerNode
  export let open: Readable<Set<ExplorerNodeId>>
  export let selected: Readable<Set<ExplorerNodeId>>
  export let selectNode: (node: ExplorerNode) => void
  export let openFolder: (node: FolderNode) => void
</script>

{#if isFolder(node)}
  <Folder {node} {open} {openFolder} {selected} {selectNode}>
    <svelte:fragment slot="append" let:node>
      <slot name="append" {node} />
    </svelte:fragment>
  </Folder>
{:else}
  <Point {node} {selected} {selectNode}>
    <svelte:fragment slot="append">
      <slot name="append" {node} />
    </svelte:fragment>
  </Point>
{/if}
