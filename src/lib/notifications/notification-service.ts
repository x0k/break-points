import { writable, type Readable, type Writable } from 'svelte/store'

import type {
  NotificationId,
  INotificationsService,
  NotificationData,
  RegisteredNotification,
} from './core'

export class NotificationService implements INotificationsService {
  private _notifications: Writable<RegisteredNotification[]> = writable([])
  private _timeouts = new Map<NotificationId, NodeJS.Timeout>()

  private removeNotification = (id: NotificationId) => {
    const timeoutId = this._timeouts.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    this._timeouts.delete(id)
    this._notifications.update((notifications) => {
      const index = notifications.findIndex((n) => n.id === id)
      if (index === -1) return notifications
      notifications.splice(index, 1)
      return notifications
    })
  }

  constructor(private readonly defaultDurationInMs = 5000) {}

  get notifications(): Readable<RegisteredNotification[]> {
    return this._notifications
  }

  showNotification = (data: NotificationData): string => {
    // Create
    const id = Date.now().toString(16)
    const notification: RegisteredNotification = {
      id,
      data,
    }
    this._notifications.update((notifications) => {
      notifications.push(notification)
      return notifications
    })
    // Register
    const timeoutId = setTimeout(
      () => this.removeNotification(id),
      data.duration ?? this.defaultDurationInMs
    )
    this._timeouts.set(id, timeoutId)
    return id
  }

  closeNotification = (id: string): void => {
    this.removeNotification(id)
  }
}
