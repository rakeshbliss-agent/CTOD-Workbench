export type FieldType = 'text' | 'number' | 'percentage' | 'date' | 'location' | 'categorical';
export type AutomationMode = 'AI Curated' | 'AI + Human' | 'Human Only';
export type ProjectStage = 'Draft' | 'Configured' | 'Files Uploaded' | 'Extracted';

export interface FieldConfig {
  id: string;
  section: string;
  name: string;
  type: FieldType;
  required: boolean;
  automationMode: AutomationMode;
  notes?: string;
}

export interface UploadedFile {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  created_at: string;
}

export interface ExtractionResult {
  id: number;
  project_id: number;
  file_id: number;
  field_key: string;
  field_name: string;
  section: string;
  extracted_value?: string | null;
  evidence_snippet?: string | null;
  page_number?: number | null;
  confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
  source_filename?: string | null;
}

export interface Project {
  id: number;
  name: string;
  indication: string;
  template_name: string;
  stage: ProjectStage | string;
  created_at: string;
  updated_at: string;
  files?: UploadedFile[];
  fields?: FieldConfig[];
  extraction_results?: ExtractionResult[];
}
