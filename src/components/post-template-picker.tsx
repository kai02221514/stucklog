"use client";

import { useState } from "react";
import { POST_TEMPLATES, type PostTemplate } from "@/data/post-templates";

export function PostTemplatePicker({
  hasContent,
  onApply,
}: {
  hasContent: boolean;
  onApply: (template: PostTemplate) => void;
}) {
  const [pendingTemplate, setPendingTemplate] = useState<PostTemplate | null>(null);

  const requestApply = (template: PostTemplate) => {
    if (hasContent) {
      setPendingTemplate(template);
      return;
    }

    setPendingTemplate(null);
    onApply(template);
  };

  const applyPendingTemplate = () => {
    if (!pendingTemplate) return;
    onApply(pendingTemplate);
    setPendingTemplate(null);
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <p className="text-sm font-medium text-[#334155]">入力テンプレート　任意</p>
        <p className="text-xs text-[#64748b]">内容欄へひな形を挿入します</p>
      </div>
      <div role="group" aria-label="投稿の入力テンプレート" className="grid grid-cols-3 gap-3">
        {POST_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => requestApply(template)}
            className="rounded-lg border border-[#cbd5e1] bg-white px-4 py-3 text-left transition hover:border-[#93c5fd] hover:bg-[#f8fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          >
            <span className="block text-sm font-medium text-[#1e40af]">{template.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[#64748b]">{template.description}</span>
          </button>
        ))}
      </div>
      {pendingTemplate ? (
        <div className="mt-3 flex items-center gap-3 rounded-md border border-[#fde68a] bg-[#fffbeb] px-4 py-3" aria-live="polite">
          <p className="min-w-0 flex-1 text-xs leading-5 text-[#92400e]">
            入力中の内容を「{pendingTemplate.label}」のひな形で置き換えます。
          </p>
          <button type="button" onClick={() => setPendingTemplate(null)} className="text-xs font-medium text-[#475569] hover:text-[#0f172a]">
            キャンセル
          </button>
          <button type="button" onClick={applyPendingTemplate} className="rounded-md bg-[#d97706] px-3 py-2 text-xs font-medium text-white hover:bg-[#b45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d97706] focus-visible:ring-offset-2">
            置き換える
          </button>
        </div>
      ) : null}
    </div>
  );
}
