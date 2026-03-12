'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

type FieldDefinition = {
  id: string;
  section: string;
  name: string;
  type: string;
  required: boolean;
  automationMode: string;
  notes?: string;
};

type UploadedFile = {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
};

type Project = {
  id: number;
  name: string;
  indication: string;
  template_name: string;
  stage: string;
  created_at?: string;
  updated_at?: string;
  files?: UploadedFile[];
  fields?: FieldDefinition[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/projects`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to load projects: ${res.status}`);
      }

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar
          title="CTOD Workbench"
          subtitle="Create projects, upload PDFs, configure fields, and prepare for extraction."
        />

        <div className="mt-6 flex justify-end">
          <Link href="/projects/new" className="button-primary">
            New Project
          </Link>
        </div>

        {loading ? (
          <div className="card mt-6 p-6 text-sm text-slate-600">Loading projects...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="card mt-6 p-8 text-center text-sm text-slate-600">
            No projects yet. Create a project to begin.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                      <span className="badge bg-slate-100 text-slate-700">{project.stage}</span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {project.indication} · {project.template_name} · {project.files?.length ?? 0} PDF(s)
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {project.fields?.length ?? 0} configured fields
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/projects/${project.id}/configure`}
                      className="button-secondary"
                    >
                      Configure Fields
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
