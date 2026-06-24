'use client';

import { useSyncExternalStore } from 'react';
import { notify } from '@/lib/stores/notifyStore';

export function useNotify() {
  return useSyncExternalStore(notify.subscribe, notify.getSnapshot, notify.getSnapshot);
}