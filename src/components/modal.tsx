"use client";

import { useEffect } from "react";

export function Modal({ title, description, children, onClose, width = "max-w-[620px]" }: { title: string; description?: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/20 px-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`w-full ${width} rounded-[10px] border border-[#cbd5e1] bg-white px-7 py-6 shadow-xl`}><h2 id="modal-title" className="text-[22px] font-bold text-[#0f172a]">{title}</h2>{description ? <p className="mt-2 text-sm text-[#64748b]">{description}</p> : null}<div className="mt-5">{children}</div></section></div>;
}
