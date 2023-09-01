import type { Readable } from 'svelte/store'

export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export type NotificationId = string

export interface NotificationData {
  type: NotificationType
  message: string
  /** in ms */
  duration?: number
}

export interface RegisteredNotification {
  id: NotificationId
  data: NotificationData
}

export interface INotificationsService {
  notifications: Readable<RegisteredNotification[]>
  showNotification(data: NotificationData): NotificationId
  closeNotification(id: NotificationId): void
}
