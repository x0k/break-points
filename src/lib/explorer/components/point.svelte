<script lang="ts">
  import type { Readable } from 'svelte/store'

  import Point from '@/lib/point.svelte'

  import type { ExplorerNode, ExplorerNodeId, PointNode } from '../core'

  export let node: PointNode
  export let selected: Readable<Set<ExplorerNodeId>>
  export let selectNode: (node: ExplorerNode) => void

  $: isSelected = $selected.has(node.id)
</script>

<Point title={node.title} on:click={() => selectNode(node)}>
  <input slot="prepend" type="checkbox" class="checkbox" checked={isSelected} />
  <slot name="append" slot="append" />
</Point>
