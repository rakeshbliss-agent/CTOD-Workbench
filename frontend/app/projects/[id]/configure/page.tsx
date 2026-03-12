'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type FieldConfig = {
  id: string;
  section: string;
  name: string;
  type: string;
  required: boolean;
  automationMode: string;
  notes?: string;
};

type BackendField = {
  id: number;
  field_key: string;
  section: string;
  name: string;
  field_type: string;
  required: string;
  automation_mode: string;
  notes?: string | null;
};

type Project = {
  id: number;
  name: string;
  indication: string;
  template_name: string;
  stage: string;
  fields?: BackendField[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const defaultFields: FieldConfig[] = [
  {
    id: 'f1',
    section: 'study',
    name: 'Study Title',
    type: 'text',
    required: true,
    automationMode: 'AI Curated',
    notes: '',
  },
  {
    id: 'f2',
    section: 'demography',
    name: 'Country',
    type: 'location',
    required: true,
    automationMode: 'AI + Human',
    notes: '',
  },
  {
    id: 'f3',
    section: 'treatment',
    name: 'Dose',
    type: 'text',
    required: true,
    automationMode: 'AI + Human',
    notes: '',
  },
];

function mapBackendFields(fields?: BackendField[]): FieldConfig[] {
  if (!fields || fields.length === 0) return defaultFields;

  return fields.map((field) => ({
    id: field.field_key,
    section: field.section,
    name: field.name,
    type: field.field_type,
    required: field.required === 'true',
    automationMode: field.automation_mode,
    notes: field.notes ?? '',
  }));
}

export default function ConfigureFieldsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!project) return 'Configure Fields';
    return `Configure Fields · ${project.name}`;
  }, [project]);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/projects/${projectId}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Failed to load project: ${res.status}`);
        }

        const data = await res.json();
        setProject(data);
        setFields(mapBackendFields(data.fields));
      } catch (err) {
        console.error(err);
        setError('Unable to load project.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const updateField = (index: number, patch: Partial<FieldConfig>) => {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...patch } : field))
    );
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: `f${Date.now()}`,
        section: 'study',
        name: '',
        type: 'text',
        required: false,
        automationMode: 'AI + Human',
        notes: '',
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${API_BASE}/projects/${projectId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to save fields: ${res.status}`);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Unable to save fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading project...
        </div>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Define the CTOD fields to be extracted and reviewed.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Section
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={field.section}
                    onChange={(e) => updateField(index, { section: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Field Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                  >
                    <option value="text">text</option>
                    <option value="number">number</option>
                    <option value="percentage">percentage</option>
                    <option value="date">date</option>
                    <option value="location">location</option>
                    <option value="categorical">categorical</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Automation
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    value={field.automationMode}
                    onChange={(e) =>
                      updateField(index, { automationMode: e.target.value })
                    }
                  >
                    <option value="AI Curated">AI Curated</option>
                    <option value="AI + Human">AI + Human</option>
                    <option value="Human Only">Human Only</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>

                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Notes
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={field.notes ?? ''}
                  onChange={(e) => updateField(index, { notes: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addField}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add Field
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Fields'}
          </button>
        </div>
      </div>
    </main>
  );
}
