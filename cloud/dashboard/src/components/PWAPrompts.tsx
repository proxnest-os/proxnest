/**
 * ProxNest Cloud — PWA UI components
 * Install banner, offline indicator, update toast
 */

import { useState } from 'react';
import { Download, WifiOff, RefreshCw, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus, useSWUpdate } from '../hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Install Banner ─────────────────────────────────── */
export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60]
          glass border border-nest-400/20 rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            bg-gradient-to-br from-nest-500 to-nest-600">
            <Download size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install ProxNest</p>
            <p className="text-xs text-nest-400 mt-0.5">
              Add to home screen for quick access &amp; offline support
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={install}
                className="px-3 py-1.5 rounded-lg bg-nest-500 hover:bg-nest-400
                  text-white text-xs font-medium transition-colors"
              >
                Install App
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="px-3 py-1.5 rounded-lg text-nest-400 hover:text-white
                  text-xs font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-nest-500 hover:text-nest-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Offline Indicator ──────────────────────────────── */
export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-[55] overflow-hidden"
        >
          <div className="bg-amber-500/90 backdrop-blur-sm px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-black">
              <WifiOff size={14} />
              You&apos;re offline — some features may be unavailable
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Update Toast ───────────────────────────────────── */
export function UpdateToast() {
  const { updateAvailable, applyUpdate } = useSWUpdate();

  if (!updateAvailable) return null;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]
        glass border border-nest-400/20 rounded-xl px-4 py-3 shadow-2xl
        flex items-center gap-3"
    >
      <RefreshCw size={16} className="text-nest-400 animate-spin" />
      <span className="text-sm text-white">New version available</span>
      <button
        onClick={applyUpdate}
        className="px-3 py-1 rounded-lg bg-nest-500 hover:bg-nest-400
          text-white text-xs font-medium transition-colors"
      >
        Update
      </button>
    </motion.div>
  );
}
