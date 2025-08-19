"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Snackbar({
  message,
  open,
}: {
  message: string | null;
  open: boolean;
}) {
  return (
    <AnimatePresence>
      {open && message ? (
        <motion.div
          key="snackbar"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 bottom-4 z-50 px-4"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto max-w-sm rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
            {message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}