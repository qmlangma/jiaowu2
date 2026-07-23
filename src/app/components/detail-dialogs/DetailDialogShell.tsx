import { motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function DetailDialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <motion.button
        aria-label="关闭明细"
        onClick={onClose}
        className="fixed inset-0 z-[60] cursor-default bg-[#101828]/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-dialog-title"
        className="fixed left-1/2 top-1/2 z-[70] flex max-h-[86vh] w-[calc(100%-32px)] max-w-[920px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_rgba(16,24,40,0.22)]"
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
      >
        <header className="flex items-center justify-between border-b border-[#e5e9f0] px-6 py-4">
          <h2 id="detail-dialog-title" className="text-lg font-semibold text-[#1d2939]">
            {title}
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-[#667085] transition hover:bg-[#f2f4f7] hover:text-[#101828]" aria-label="关闭">
            <X size={20} />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        <footer className="flex justify-end border-t border-[#e5e9f0] px-6 py-4">
          <button onClick={onClose} className="rounded-sm bg-[#165dff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0e42d2]">
            我知道了
          </button>
        </footer>
      </motion.section>
    </>
  );
}
