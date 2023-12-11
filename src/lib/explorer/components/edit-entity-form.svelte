<script lang="ts">
  import type { Readable } from 'svelte/store'

  import type { INotificationsService } from '@/lib/notifications'

  import {
    type ILocationService,
    type ExplorerNodeId,
    getNodeById,
    type ExplorerNode,
    isFolder,
  } from '../core'

  export let nodeId: ExplorerNodeId
  export let nodes: Readable<ExplorerNode[]>
  export let onSubmit: (node: ExplorerNode) => void
  export let locationService: ILocationService
  export let notificationsService: INotificationsService

  $: node = getNodeById($nodes, nodeId)

  import EditFolderForm from './edit-folder-form.svelte'
  import EditPointForm from './edit-point-form.svelte'
</script>

{#if node}
  {#if isFolder(node)}
    <EditFolderForm {node} {onSubmit} />
  {:else}
    <EditPointForm {node} {onSubmit} {locationService} {notificationsService} />
  {/if}
{/if}
