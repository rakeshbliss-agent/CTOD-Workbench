import Link from 'next/link';
import { Project } from '@/lib/types';

export function ProjectSummary({ project }: { project: Project }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{project.name}</h3>
            <span className="badge bg-slate-100 text-slate-700">{project.stage}</span>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {project.indication} · {project.template_name}
          </div>
          <div className="mt-2 text-sm text-slate-500">
            {(project.files?.length ?? 0)} uploaded PDF(s) · {(project.fields?.length ?? 0)} configured fields
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/projects/${project.id}/configure`} className="button-secondary">Configure</Link>
        </div>
      </div>
    </div>
  );
}
