import { FieldConfig, Project } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listProjects(): Promise<Project[]> {
  return handle<Project[]>(await fetch(`${API_BASE}/projects`, { cache: 'no-store' }));
}

export async function getProject(id: string): Promise<Project> {
  return handle<Project>(await fetch(`${API_BASE}/projects/${id}`, { cache: 'no-store' }));
}

export async function createProject(payload: {
  name: string;
  indication: string;
  template_name: string;
}): Promise<Project> {
  return handle<Project>(await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
}

export async function saveFields(projectId: string, fields: FieldConfig[]): Promise<{ message: string }> {
  return handle<{ message: string }>(await fetch(`${API_BASE}/projects/${projectId}/fields`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  }));
}

export async function uploadPdf(projectId: string, file: File): Promise<{ message: string; file_id: number }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/projects/${projectId}/upload`, {
    method: 'POST',
    body: form,
  });
  return handle<{ message: string; file_id: number }>(res);
}
