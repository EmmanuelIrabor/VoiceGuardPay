export type NotifyType = 'success' | 'error' | 'neutral' | 'warning';

export interface Notification {
  id: string;
  type: NotifyType;
  message: string;
}

type Listener = (notifications: Notification[]) => void;

function createNotifyStore() {
  let notifications: Notification[] = [];
  const listeners = new Set<Listener>();

  function emit() {
    listeners.forEach((listener) => listener(notifications));
  }

  function push(type: NotifyType, message: string) {
    const id = crypto.randomUUID();
    notifications = [...notifications, { id, type, message }];
    emit();

    setTimeout(() => {
      notifications = notifications.filter((n) => n.id !== id);
      emit();
    }, 5000);

    return id;
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      listener(notifications);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return notifications;
    },
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    neutral: (message: string) => push('neutral', message),
    warning: (message: string) => push('warning', message),
    dismiss: (id: string) => {
      notifications = notifications.filter((n) => n.id !== id);
      emit();
    },
  };
}

export const notify = createNotifyStore();