<script lang="ts">
  import { Download, Upload } from 'lucide-svelte'
  import { parse, stringify } from 'devalue'

  import {
    ExplorerContainer,
    ExplorerService,
    LocationService,
  } from '@/lib/explorer'
  import { nodes, open, selected } from '@/lib/state'
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

  const explorerService = new ExplorerService({
    nodes,
    open,
    selected,
  })
  const locationService = new LocationService(
    new YandexGeocodeAPI('90533b74-d6fd-4a43-be42-eb5cabf34272')
  )
  const notificationsService = new NotificationService()

  async function exportSelectedNodes() {
    try {
      const nodes = explorerService.getSelectedSubTreeOrWholeTree()
      await blobSave(
        `BP_${new Date().toISOString().slice(0, -5)}.json`,
        makeJSONBlob(stringify(nodes))
      )
      notificationsService.showNotification({
        type: NotificationType.Success,
        message:
          'You successfully export selected (either all if no selection) points',
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
      const nodes = parse(text)
      explorerService.importNodes(nodes)
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
    <span class="btn btn-ghost normal-case text-xl">BP</span>
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
