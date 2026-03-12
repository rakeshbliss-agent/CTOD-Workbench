'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { getProject, listExtractions, runExtraction } from '@/lib/api';
import { ExtractionResult, Project } from '@/lib/types';

export default function ExtractionPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!project) return 'Extraction Review';
    return `Extraction Review · ${project.name}`;
  }, [project]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectData, extractionData] = await Promise.all([
        getProject(projectId),
        listExtractions(projectId),
      ]);

      setProject(projectData);
      setResults(extractionData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load extraction review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadAll();
    }
  }, [projectId]);

  const handleRun = async () => {
    try {
      setRunning(true);
      setError(null);
      await runExtraction(projectId);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Extraction failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Topbar
          title={title}
          subtitle="Run draft extraction from uploaded PDF(s) and review evidence-backed results."
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="button-primary disabled:opacity-60"
          >
            {running ? 'Running extraction...' : 'Run Extraction'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="card mt-6 p-6 text-sm text-slate-600">Loading extraction results...</div>
        ) : results.length === 0 ? (
          <div className="card mt-6 p-6 text-sm text-slate-600">
            No extraction results yet. Click <strong>Run Extraction</strong>.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {results.map((result) => (
              <div key={result.id} className="card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{result.field_name}</h2>
                      <span className="badge bg-slate-100 text-slate-700">{result.section}</span>
                      <span className="badge bg-blue-50 text-blue-700">
                        {Math.round((result.confidence || 0) * 100)}% confidence
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Source: {result.source_filename || 'Unknown file'}
                      {result.page_number ? ` · Page ${result.page_number}` : ''}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="label">Extracted value</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 min-h-24">
                      {result.extracted_value || 'No value extracted'}
                    </div>
                  </div>

                  <div>
                    <label className="label">Evidence snippet</label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 min-h-24 whitespace-pre-wrap">
                      {result.evidence_snippet || 'No evidence found'}
                    </div>
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
