<script lang="ts">
  import { Download, Upload } from 'lucide-svelte'
  import { parse, stringify } from 'devalue'
  import { get } from 'svelte/store'

  import {
    ExplorerContainer,
    ExplorerService,
    LocationService,
    extractSelectedSubTree,
    mergeTrees,
    MapURLGeneratorFactory,
  } from '@/lib/explorer'
  import { nodes, open, selected, mapType } from '@/lib/state'
  import { YandexGeocodeAPI } from '@/lib/yandex-geocode-api'
  import {
    NotificationService,
    NotificationType,
    NotificationsContainer,
  } from '@/lib/notifications'
  import {
    JSON_FILE_EXTENSION,
    JSON_MIME_TYPE,
    blobOpen,
    blobSave,
    makeJSONBlob,
  } from '@/lib/file'

  const explorerService = new ExplorerService(
    {
      nodes,
      open,
      selected,
      mapType,
    },
    new MapURLGeneratorFactory()
  )
  const locationService = new LocationService(
    new YandexGeocodeAPI('90533b74-d6fd-4a43-be42-eb5cabf34272')
  )
  const notificationsService = new NotificationService()

  async function exportSelectedNodes() {
    try {
      const selectedNodes = get(selected)
      const allNodes = get(nodes)
      const isSelectionEmpty = selectedNodes.size === 0
      const tree = isSelectionEmpty
        ? allNodes
        : extractSelectedSubTree(allNodes, selectedNodes)
      await blobSave(
        `BP_${new Date().toISOString().slice(0, -5)}.json`,
        makeJSONBlob(stringify(tree))
      )
      notificationsService.showNotification({
        type: NotificationType.Success,
        message: `You successfully export ${
          isSelectionEmpty ? 'all' : 'selected'
        } points`,
      })
    } catch (error) {
      notificationsService.showNotification({
        type: NotificationType.Error,
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error during export',
      })
    }
  }

  async function importPoints() {
    try {
      const blob = await blobOpen({
        description: 'Workspace JSON file',
        extensions: [JSON_FILE_EXTENSION],
        mimeTypes: [JSON_MIME_TYPE],
      })
      const text = await blob.text()
      const newNodes = parse(text)
      nodes.update((ns) => mergeTrees(ns, newNodes))
      notificationsService.showNotification({
        type: NotificationType.Success,
        message: `Points successfully imported`,
      })
    } catch (error) {
      notificationsService.showNotification({
        type: NotificationType.Error,
        message:
          error instanceof Error
            ? error.message
            : `Unknown error during import`,
      })
    }
  }
</script>

<div class="navbar bg-base-100">
  <div class="flex-1">
    <span class="md:hidden btn btn-ghost normal-case text-xl">BP</span>
    <span class="hidden md:inline-flex btn btn-ghost normal-case text-xl"
      >Break Points</span
    >
  </div>
  <div class="flex gap-4 px-2 align-baseline">
    <button class="btn btn-sm" on:click={exportSelectedNodes}>
      <Upload /> Export
    </button>
    <button class="btn btn-sm" on:click={importPoints}>
      <Download /> Import
    </button>
  </div>
</div>

<div class="p-4 mb-20 max-w-xl mx-auto">
  <ExplorerContainer
    {explorerService}
    {locationService}
    {notificationsService}
  />
</div>

<NotificationsContainer {notificationsService} />
