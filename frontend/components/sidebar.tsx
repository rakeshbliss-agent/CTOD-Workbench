import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="text-xl font-semibold text-brand-600">ClintoAI</div>
      <div className="mt-1 text-sm text-slate-500">CTOD Prototype · Part 2</div>

      <nav className="mt-8 space-y-2 text-sm">
        <Link href="/" className="block rounded-xl px-3 py-2 hover:bg-slate-50">
          Dashboard
        </Link>
        <Link href="/projects/new" className="block rounded-xl px-3 py-2 hover:bg-slate-50">
          New Project
        </Link>
      </nav>

      <div className="mt-10 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Part 2 adds PDF text extraction, draft field-level outputs, evidence snippets, and review workflow.
      </div>
    </aside>
  );
}
