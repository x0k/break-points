<script lang="ts">
  import { Pencil, Plus, Trash, X } from 'lucide-svelte'

  import type { INotificationsService } from '@/lib/notifications'
  import * as Dialog from '@/lib/components/dialog'
  import { Button } from '@/lib/components/button'

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
  function openEditDialog(nodeId: ExplorerNodeId) {
    editableNodeId = nodeId
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
          <Button
            variant="success"
            size="xs"
            on:click={() => openCreateDialog(node.id)}
            ><Plus size={16} /></Button
          >
        {:else}
          <span class="truncate font-thin ml-auto" dir="rtl">
            {node.address}
          </span>
        {/if}
        <Button
          size="xs"
          on:click={(e) => {
            e.stopPropagation()
            e.preventDefault()
            openEditDialog(node.id)
          }}
        >
          <Pencil />
        </Button>
        <Button
          variant="destructive"
          size="xs"
          on:click={(e) => {
            e.stopPropagation()
            e.preventDefault()
            openRemoveDialog(node.id)
          }}><Trash size={16} /></Button
        >
      </svelte:fragment>
    </Node>
  {/each}
  {#if $selected.size === 0}
    <Button on:click={() => openCreateDialog()}>
      <Plus /> Add
    </Button>
  {:else}
    <div class="flex flex-row gap-2">
      <Button class="grow" on:click={openContinueDialog}
        >Continue with {$selected.size} points</Button
      >
      <Button variant="destructive" on:click={explorerService.clearSelection}>
        <X />
      </Button>
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
