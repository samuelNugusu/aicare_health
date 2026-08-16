export type UserRole = 'client' | 'doctor' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: UserRole;
  specialty?: string;
  isVerified?: boolean;
  createdAt?: any;
  lastLogin?: any;
}

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

export interface LabResultRecord {
  id?: string;
  userId: string;
  patientName?: string;
  patientEmail?: string;
  fileName: string;
  uploadDate: any;
  status: 'pending' | 'processing' | 'completed' | 'verified' | 'failed' | 'error';
  analysis: LabAnalysisData;
  verifiedByDoctorId?: string;
  verifiedByDoctorName?: string;
  doctorSpecialty?: string;
  doctorNotes?: string;
  verifiedAt?: any;
  previewUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

