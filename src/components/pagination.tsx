"use client";

type PaginationProps = {
  ariaLabel: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ ariaLabel, currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={ariaLabel} className="mt-6 flex items-center justify-center gap-2">
      <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#475569] transition hover:border-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-40">前へ</button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button key={page} type="button" aria-current={currentPage === page ? "page" : undefined} onClick={() => onPageChange(page)} className={`size-9 rounded-md border text-sm font-medium transition ${currentPage === page ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-[#cbd5e1] bg-white text-[#475569] hover:border-[#94a3b8]"}`}>{page}</button>
      ))}
      <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 rounded-md border border-[#cbd5e1] bg-white px-3 text-sm font-medium text-[#475569] transition hover:border-[#94a3b8] disabled:cursor-not-allowed disabled:opacity-40">次へ</button>
    </nav>
  );
}
