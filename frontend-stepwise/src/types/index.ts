
export interface User {
  username: string;
  token: string;
}

export interface Question {
  id: string;
  question: string;
  context: string;
  question_valid?: boolean;
  tasks: TaskGroup[];
  reasoning: string;
  reasoning_valid?: boolean;
  tasks_complete?: boolean;
  feedback?: string;
  categories: string[];
  annotated_by: number;
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

export interface AnnotationResponse {
  questionId: string;
  isValid: boolean;
  tasks: TaskGroup[];
  isReasoningValid: boolean;
  areMissingValuesCorrect: boolean;
  feedback?: string;
}
