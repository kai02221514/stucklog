"use client";

import { useState } from "react";
import { INPUT_LIMITS } from "@/lib/input-limits";

export function TechnologyInput({ value, onChange, helper = "Enterまたは「追加」で登録できます（最大8件）" }: { value: string[]; onChange: (technologies: string[]) => void; helper?: string }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const addTechnology = () => {
    const technology = input.trim();
    if (!technology) return;
    if (technology.length > INPUT_LIMITS.technology) { setError(`技術名は${INPUT_LIMITS.technology}文字以内で入力してください。`); return; }
    if (value.some((item) => item.toLowerCase() === technology.toLowerCase())) { setError("同じ技術は重複登録できません。"); return; }
    if (value.length >= INPUT_LIMITS.technologies) { setError(`使用技術は最大${INPUT_LIMITS.technologies}件まで登録できます。`); return; }
    onChange([...value, technology]); setInput(""); setError("");
  };

  return <div>{value.length > 0 ? <div className="mb-2 flex flex-wrap gap-2">{value.map((technology) => <span key={technology} className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1.5 text-[13px] font-medium text-[#1d4ed8]">{technology}<button type="button" aria-label={`${technology}を削除`} onClick={() => onChange(value.filter((item) => item !== technology))} className="text-[#64748b] hover:text-[#0f172a]">×</button></span>)}</div> : null}<div className="flex gap-3"><input value={input} maxLength={INPUT_LIMITS.technology} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTechnology(); } }} placeholder="技術名を入力" className="h-11 min-w-0 flex-1 rounded-lg border border-[#cbd5e1] bg-white px-4 text-sm text-[#334155] outline-none placeholder:text-[#64748b] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]" /><button type="button" onClick={addTechnology} className="h-11 w-[88px] rounded-lg border border-[#bfdbfe] bg-white text-sm font-medium text-[#1d4ed8] hover:bg-[#f5f9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]">追加</button></div><p className={`mt-2 text-xs ${error ? "text-[#b91c1c]" : "text-[#64748b]"}`}>{error || helper}</p></div>;
}
