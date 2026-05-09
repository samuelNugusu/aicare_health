export interface LabAnalysisData {
  summary: string;
  keyMetrics: {
    marker: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
  recommendations: string[];
  predictiveAlerts: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}
