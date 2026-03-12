'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { createProject, uploadPdf } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [indication, setIndication] = useState('Rheumatoid Arthritis');
  const [templateName, setTemplateName] = useState('CTOD Standard Template');
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const project = await createProject({ name, indication, template_name: templateName });
      if (files?.length) {
        for (const file of Array.from(files)) {
          await uploadPdf(String(project.id), file);
        }
      }
      router.push(`/projects/${project.id}/configure`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar
          title="Create Project"
          subtitle="Create a CTOD curation job, upload the source PDF(s), and prepare the field schema."
        />
        <form onSubmit={onSubmit} className="card mt-6 max-w-3xl p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label">Project name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AIM-RA CTOD demo" required />
            </div>
            <div>
              <label className="label">Indication</label>
              <input className="input" value={indication} onChange={(e) => setIndication(e.target.value)} required />
            </div>
            <div>
              <label className="label">Template</label>
              <input className="input" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Upload PDF(s)</label>
              <input className="input" type="file" accept="application/pdf" multiple onChange={(e) => setFiles(e.target.files)} />
            </div>
          </div>
          {error ? <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <div className="mt-6 flex gap-3">
            <button type="submit" className="button-primary" disabled={saving}>{saving ? 'Saving...' : 'Create project'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
