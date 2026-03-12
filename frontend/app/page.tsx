import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ProjectSummary } from '@/components/project-summary';
import { listProjects } from '@/lib/api';

export default async function HomePage() {
  const projects = await listProjects();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar
          title="CTOD Curation Dashboard"
          subtitle="Real Part 1 foundation: project creation, PDF upload, field configuration, and backend persistence."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Active Projects</h2>
                <p className="mt-1 text-sm text-slate-600">Each project can hold uploaded PDFs and the CTOD field schema for later extraction.</p>
              </div>
              <Link href="/projects/new" className="button-primary">New Project</Link>
            </div>
            <div className="mt-5 space-y-4">
              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  No projects yet. Create a new CTOD curation project to begin.
                </div>
              ) : (
                projects.map((project) => <ProjectSummary key={project.id} project={project} />)
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-base font-semibold">Part 1 Scope</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Project creation</li>
                <li>Single or multiple PDF upload</li>
                <li>CTOD field schema setup</li>
                <li>SQLite persistence</li>
                <li>Backend APIs ready for extraction in Part 2</li>
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="text-base font-semibold">What comes next</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Part 2 will parse PDFs, create evidence-backed extraction drafts, and pass them into a row-level curator workbench.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
