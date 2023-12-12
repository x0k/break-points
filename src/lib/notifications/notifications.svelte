<script lang="ts">
  import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-svelte'

  import * as Alert from '@/lib/components/alert'

  import { type INotificationsService, NotificationType } from './core'

  export let notificationsService: INotificationsService

  let notifications = notificationsService.notifications

  const ICONS: Record<NotificationType, any> = {
    [NotificationType.Info]: Info,
    [NotificationType.Success]: CheckCircle,
    [NotificationType.Warning]: AlertTriangle,
    [NotificationType.Error]: XCircle,
  }
  const TITLES: Record<NotificationType, string> = {
    [NotificationType.Info]: 'Info',
    [NotificationType.Success]: 'Success',
    [NotificationType.Warning]: 'Warning',
    [NotificationType.Error]: 'Error',
  }
</script>

<div
  class="z-[500] fixed bottom-0 p-4 whitespace-nowrap max-w-fit flex flex-col gap-2 end-0 start-auto top-auto"
>
  {#each $notifications as n (n.id)}
    <Alert.Root
      variant={n.data.type === NotificationType.Error
        ? 'destructive'
        : n.data.type === NotificationType.Success
          ? 'success'
          : 'default'}
      class="bg-primary-foreground"
    >
      <svelte:component this={ICONS[n.data.type]} class="h-4 w-4" />
      <Alert.Title>{TITLES[n.data.type]}</Alert.Title>
      <Alert.Description>{n.data.message}</Alert.Description>
    </Alert.Root>
  {/each}
</div>
