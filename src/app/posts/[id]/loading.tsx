import { SiteHeader } from "@/components/site-header";

export default function PostDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <SiteHeader active="projects" />
      <main className="mx-auto w-full max-w-[900px] pb-16 pt-9">
        <div className="h-4 w-28 animate-pulse rounded bg-[#e2e8f0]" />
        <div className="mt-5 min-h-[640px] animate-pulse rounded-lg border border-[#e2e8f0] bg-white px-9 py-8">
          <div className="h-6 w-36 rounded bg-[#eaf2ff]" />
          <div className="mt-6 h-8 w-2/3 rounded bg-[#e2e8f0]" />
          <div className="mt-6 h-3 w-16 rounded bg-[#e2e8f0]" />
          <div className="mt-6 border-t border-[#e2e8f0] pt-6">
            <div className="h-4 w-12 rounded bg-[#e2e8f0]" />
            <div className="mt-4 h-20 rounded bg-[#f1f5f9]" />
          </div>
        </div>
      </main>
    </div>
  );
}
