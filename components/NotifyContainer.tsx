'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useNotify } from '@/lib/hooks/useNotify';
import { notify, type NotifyType } from '@/lib/stores/notifyStore';

const ICONS: Record<NotifyType, string> = {
  success: 'fa-solid fa-circle-check',
  error: 'fa-solid fa-circle-exclamation',
  warning: 'fa-solid fa-triangle-exclamation',
  neutral: 'fa-solid fa-circle-info',
};

const TITLES: Record<NotifyType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  neutral: 'Info',
};

export default function NotifyContainer() {
  const notifications = useNotify();

  return (
    <div className="notify-container">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`notify-alert notify-alert--${n.type}`}>
              <i className={`${ICONS[n.type]} notify-alert__icon`} />
              <div className="notify-alert__body">
                <p className="notify-alert__title text-xs">{TITLES[n.type]}</p>
                <p className="notify-alert__message text-xs">{n.message}</p>
              </div>
              <button
                className="notify-alert__close"
                onClick={() => notify.dismiss(n.id)}
                aria-label="Close notification"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}