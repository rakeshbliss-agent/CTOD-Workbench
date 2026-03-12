'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type FieldDefinition = {
  id: number;
  field_key: string;
  section: string;
  name: string;
  field_type: string;
  required: string;
  automation_mode: string;
  notes?: string | null;
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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">CTOD Workbench</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create projects, upload PDFs, configure fields, and prepare for extraction.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Project
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Loading projects...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            No projects yet. Create a project to begin.
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {project.stage}
                      </span>
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
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Configure Fields
                    </Link>

                    <Link
                      href={`/projects/${project.id}/extract`}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Extraction Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
