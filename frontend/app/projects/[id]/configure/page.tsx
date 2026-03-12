'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { getProject, saveFields } from '@/lib/api';
import { FieldConfig, FieldType, AutomationMode, Project } from '@/lib/types';

const starterFields: FieldConfig[] = [
  { id: 'study-title', section: 'study', name: 'Study Title', type: 'text', required: true, automationMode: 'AI Curated' },
  { id: 'country', section: 'demos', name: 'Country', type: 'location', required: true, automationMode: 'AI + Human' },
  { id: 'dose', section: 'treatment', name: 'Dose', type: 'text', required: true, automationMode: 'AI + Human' },
  { id: 'orr', section: 'outcomes', name: 'ORR', type: 'percentage', required: true, automationMode: 'Human Only' },
];

const fieldTypes: FieldType[] = ['text', 'number', 'percentage', 'date', 'location', 'categorical'];
const automationModes: AutomationMode[] = ['AI Curated', 'AI + Human', 'Human Only'];

export default function ConfigurePage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>(starterFields);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getProject(params.id).then((data) => {
      setProject(data);
      if (data.fields && data.fields.length > 0) {
        setFields(data.fields);
      }
    });
  }, [params.id]);

  const updateField = <K extends keyof FieldConfig>(index: number, key: K, value: FieldConfig[K]) => {
    setFields((prev) => prev.map((field, idx) => (idx === index ? { ...field, [key]: value } : field)));
  };

  const addField = () => {
    setFields((prev) => [...prev, {
      id: `field-${Date.now()}`,
      section: 'study',
      name: '',
      type: 'text',
      required: false,
      automationMode: 'AI + Human',
    }]);
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveFields(params.id, fields);
      setMessage('Field schema saved successfully. Part 2 can now attach extraction logic to these definitions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar
          title={project ? `Configure Fields · ${project.name}` : 'Configure Fields'}
          subtitle="Define the CTOD schema the backend will later use for evidence-backed extraction."
        />
        <div className="card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Field Registry</h2>
              <p className="mt-1 text-sm text-slate-600">Part 1 persists the schema. Part 2 will use it to drive extraction and validation.</p>
            </div>
            <button type="button" className="button-secondary" onClick={addField}>Add field</button>
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <label className="label">Section</label>
                    <input className="input" value={field.section} onChange={(e) => updateField(index, 'section', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Field name</label>
                    <input className="input" value={field.name} onChange={(e) => updateField(index, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="select" value={field.type} onChange={(e) => updateField(index, 'type', e.target.value as FieldType)}>
                      {fieldTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Automation</label>
                    <select className="select" value={field.automationMode} onChange={(e) => updateField(index, 'automationMode', e.target.value as AutomationMode)}>
                      {automationModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} />
                      Required
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {message ? <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
          <div className="mt-6 flex gap-3">
            <button type="button" className="button-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save field schema'}</button>
          </div>
        </div>
      </main>
    </div>
  );
}
