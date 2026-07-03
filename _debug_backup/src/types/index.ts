export interface ResumeRecord {
  id: string;
  userId: string;
  originalFilename: string;
  fileType: 'PDF' | 'DOCX' | 'TXT';
  fileSizeBytes: number;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  resumeId: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overallScore: number | null;
  dimensionScores: DimensionScores | null;
  llmModel: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  resume?: { originalFilename: string };
  results?: AnalysisResultItem[];
}

export interface DimensionScores {
  completeness: number;
  keywords: number;
  format: number;
  language: number;
}

export interface AnalysisResultItem {
  id: string;
  analysisId: string;
  dimension: 'COMPLETENESS' | 'KEYWORDS' | 'FORMAT' | 'LANGUAGE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  suggestion: string;
  positionHint: string | null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
