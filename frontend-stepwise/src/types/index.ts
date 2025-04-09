
export interface User {
  username: string;
  token: string;
}

export interface Question {
  id: string;
  question: string;
  context: string;
  isValid?: boolean;
  tasks: TaskGroup[];
  reasoning: string;
  isReasoningValid?: boolean;
  missingValues: string;
  areMissingValuesCorrect?: boolean;
  feedback?: string;
  isCompleted: boolean;
  categories: string[];
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  enabled: boolean;
}

export interface AnnotationResponse {
  questionId: string;
  isValid: boolean;
  tasks: TaskGroup[];
  isReasoningValid: boolean;
  areMissingValuesCorrect: boolean;
  feedback?: string;
}
