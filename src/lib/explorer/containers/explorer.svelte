<script lang="ts">
  import { Plus, Trash, X } from 'lucide-svelte'

  import type { INotificationsService } from '@/lib/notifications'
  import * as Dialog from '@/lib/components/dialog'

  import {
    isFolder,
    type ExplorerNodeId,
    type CreateNode,
    type IExplorerService,
    type ExplorerNode,
    type ILocationService,
    extractNodes,
    isPoint,
    type PointNode,
  } from '../core'
  import {
    RemoveEntityForm,
    Node,
    CreateEntityForm,
    ContinueForm,
    EditEntityForm,
    type ContinueFormData,
  } from '../components'

  export let explorerService: IExplorerService
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  let { nodes, open, selected } = explorerService
  $: points = extractNodes<PointNode>({ nodes: $nodes, selector: isPoint })
  let mapType = explorerService.mapType

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

  let isContinueDialogOpen = false
  function openContinueDialog() {
    isContinueDialogOpen = true
  }
  function closeContinueDialog() {
    isContinueDialogOpen = false
  }
  function onContinueDialogSubmit({ mapType, ...rest }: ContinueFormData) {
    explorerService.openMapWithSelectedPoints(mapType, rest)
  }

  let isEditDialogOpen = false
  let editableNodeId: ExplorerNodeId
  function openEditDialog() {
    if ($selected.size === 0) {
      return
    }
    editableNodeId = $selected.values().next().value
    isEditDialogOpen = true
  }
  function closeEditDialog() {
    isEditDialogOpen = false
  }
  function onEditDialogSubmit(node: ExplorerNode) {
    explorerService.updateNode(node)
    closeEditDialog()
  }
</script>

<div class="flex flex-col gap-4 justify-stretch">
  {#each $nodes as n (n.id)}
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
          <span class="truncate font-thin grow-1 ml-auto" dir="rtl">
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
    <div class="flex flex-row gap-2">
      {#if $selected.size === 1}
        <button class="btn btn-primary grow" on:click={openEditDialog}>
          Edit selected point
        </button>
      {:else}
        <button class="btn btn-primary grow" on:click={openContinueDialog}
          >Continue with {$selected.size} points</button
        >
      {/if}
      <button
        class="btn btn-secondary"
        on:click={explorerService.clearSelection}
      >
        <X />
      </button>
    </div>
  {/if}
</div>

<Dialog.Root open={isContinueDialogOpen} onOpenChange={closeContinueDialog}>
  <Dialog.Content>
    <ContinueForm
      {notificationsService}
      {locationService}
      {points}
      mapType={$mapType}
      onMapTypeChange={explorerService.setMapType}
      onSubmit={onContinueDialogSubmit}
    />
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isCreateDialogOpen} onOpenChange={closeCreateDialog}>
  <Dialog.Content>
    <CreateEntityForm
      {locationService}
      {notificationsService}
      parentId={createDialogOptions.parentId}
      onSubmit={onCreateDialogSubmit}
    />
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isRemoveDialogOpen} onOpenChange={closeRemoveDialog}>
  <Dialog.Content>
    <RemoveEntityForm
      {nodes}
      nodeId={removeDialogOptions.nodeId}
      onSubmit={onRemoveDialogSubmit}
    />
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root open={isEditDialogOpen} onOpenChange={closeEditDialog}>
  <Dialog.Content>
    {#key editableNodeId}
      <EditEntityForm
        nodeId={editableNodeId}
        {locationService}
        {notificationsService}
        {nodes}
        onSubmit={onEditDialogSubmit}
      />
    {/key}
  </Dialog.Content>
</Dialog.Root>
