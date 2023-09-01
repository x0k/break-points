<script lang="ts">
  import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-svelte'

  import { type INotificationsService, NotificationType } from './core'

  export let notificationsService: INotificationsService

  let notifications = notificationsService.notifications

  const ICONS: Record<NotificationType, any> = {
    [NotificationType.Info]: Info,
    [NotificationType.Success]: CheckCircle,
    [NotificationType.Warning]: AlertTriangle,
    [NotificationType.Error]: XCircle,
  }
</script>

<div class="toast">
  {#each $notifications as n}
    <div class={`alert alert-${n.data.type}`}>
      <svelte:component this={ICONS[n.data.type]} />
      <span>{n.data.message}</span>
    </div>
  {/each}
</div>
