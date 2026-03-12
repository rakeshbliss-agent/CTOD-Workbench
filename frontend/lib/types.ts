export type FieldType = 'text' | 'number' | 'percentage' | 'date' | 'location' | 'categorical';
export type AutomationMode = 'AI Curated' | 'AI + Human' | 'Human Only';
export type ProjectStage = 'Draft' | 'Configured' | 'Files Uploaded';

export interface FieldConfig {
  id: string;
  section: string;
  name: string;
  type: FieldType;
  required: boolean;
  automationMode: AutomationMode;
}

export interface UploadedFile {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  created_at: string;
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
}
