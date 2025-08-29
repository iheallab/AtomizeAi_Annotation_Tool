export interface UserType {
  username: string;
  token: string;
  userId: number;
  email: string;
  role: string;
}

export interface AssignmentHistoryItem {
  type: string; // "automatic" or "manual"
  assigned_at: string;
  question_ids: number[];
}

export interface AssignCounter {
  automatic_count: number;
  manual_count: number;
  current_type: string; // "automatic" or "manual"
  assigned_at: string;
  history: AssignmentHistoryItem[];
}

export interface Question {
  isValid?: boolean;
  isReasoningValid?: boolean;
  isCompleted?: boolean;
  id: number;
  _id: string;
  question: string;
  context: string;
  question_valid?: boolean;
  tasks: TaskGroup[];
  reasoning: string;
  reasoning_valid?: boolean;
  missing_data?: boolean;
  feedback?: string;
  categories: string[];
  annotated_by: number;
  model: string;
  batch_id: number;
  added_tasks?: AddedTask[];
  assign_counter?: AssignCounter;
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  valid: boolean;
}

export interface AddedTask {
  id: string;
  name: string;
  conceptId: string;
  category: string;
  variable: string;
  description?: string;
  valid: boolean;
}

export interface AnnotationResponse {
  questionId: string;
  isValid: boolean;
  tasks: TaskGroup[];
  isReasoningValid: boolean;
  areMissingValuesCorrect: boolean;
  feedback?: string;
}

// New interfaces for AddTask component
export interface Category {
  id: string;
  name: string;
  variables: Variable[];
}

export interface Variable {
  id: string;
  name: string;
  conceptId: string;
  description?: string;
  category?: string;
}
