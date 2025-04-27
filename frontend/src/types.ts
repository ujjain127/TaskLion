export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  importance_score: number | null;
  importance_explanation: string | null;
  importance_category?: 'low' | 'medium' | 'high';
  insights?: string[];
  analysis_time?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  completed: boolean;
}