<script lang="ts">
  import { AlertTriangle, Plus, Trash } from 'lucide-svelte'

  import type { INotificationsService } from '@/lib/notifications'
  import Dialog from '@/lib/dialog.svelte'

  import {
    isFolder,
    type ExplorerNodeId,
    type CreateNode,
    type IExplorerService,
    type ExplorerNode,
    type ILocationService,
  } from '../core'
  import { RemoveDialog, Node, CreateDialog } from '../components'

  export let explorerService: IExplorerService
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let nodes = explorerService.nodes
  let open = explorerService.open
  let selected = explorerService.selected

  interface RemoveDialogOptions {
    nodeId: ExplorerNodeId
  }

  let isRemoveDialogOpen = false
  let removeDialogOptions: RemoveDialogOptions = { nodeId: 'INVALID' }

  function openRemoveDialog(nodeId: ExplorerNodeId) {
    removeDialogOptions = { nodeId }
    isRemoveDialogOpen = true
  }

  function closeRemoveDialog() {
    isRemoveDialogOpen = false
  }

  function onRemoveDialogSubmit(node: ExplorerNode) {
    explorerService.removeNode(node)
    closeRemoveDialog()
  }

  interface CreateDialogOptions {
    parentId?: ExplorerNodeId
  }

  let isCreateDialogOpen = false
  let createDialogOptions: CreateDialogOptions = {}

  function openCreateDialog(parentId?: ExplorerNodeId) {
    createDialogOptions = { parentId }
    isCreateDialogOpen = true
  }

  function closeCreateDialog() {
    isCreateDialogOpen = false
  }

  function onCreateDialogSubmit(data: CreateNode) {
    explorerService.createAndInsertNode(data)
    closeCreateDialog()
  }
</script>

<div class="flex flex-col gap-3 justify-stretch">
  {#each $nodes as n}
    <Node
      node={n}
      {open}
      {selected}
      openFolder={explorerService.openFolder}
      selectNode={explorerService.selectNode}
    >
      <svelte:fragment slot="append" let:node>
        {#if isFolder(node)}
          <button
            class="btn btn-xs btn-success"
            on:click|stopPropagation={() => openCreateDialog(node.id)}
            ><Plus size={16} /></button
          >
        {:else}
          <span class="truncate max-w-xs" dir="rtl">
            {node.address}
          </span>
        {/if}
        <button
          class="btn btn-xs btn-error"
          on:click|stopPropagation={() => openRemoveDialog(node.id)}
          ><Trash size={16} /></button
        >
      </svelte:fragment>
    </Node>
  {/each}
  {#if $selected.size === 0}
    <button class="btn btn-accent" on:click={() => openCreateDialog()}>
      <Plus /> Add
    </button>
  {:else}
    <span>You selected {$selected.size} points</span>
    <div class="flex flex-row gap-2">
      <button
        class="btn btn-sm btn-primary flex-1"
        on:click={explorerService.openMapWithSelectedPoints}
      >
        Continue</button
      >
      <button
        class="btn btn-sm btn-secondary flex-1"
        on:click={explorerService.clearSelection}
      >
        Clear selection
      </button>
    </div>
  {/if}
</div>

<Dialog open={isCreateDialogOpen} onClose={closeCreateDialog}>
  <CreateDialog
    {locationService}
    {notificationsService}
    parentId={createDialogOptions.parentId}
    onSubmit={onCreateDialogSubmit}
  />
</Dialog>

<Dialog open={isRemoveDialogOpen} onClose={closeRemoveDialog}>
  <RemoveDialog
    {nodes}
    nodeId={removeDialogOptions.nodeId}
    onSubmit={onRemoveDialogSubmit}
  />
</Dialog>
