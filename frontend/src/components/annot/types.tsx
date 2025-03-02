export type TaskVars = {
  valid: boolean;
  variable: string;
};
export type TaskData = {
  task_id: number; // Change from string to number
  task: string;
  table: string;
  valid?: boolean;
  variables: TaskVars[];
};

export type QuestionData = {
  _id: string;
  category: string;
  icu_type: string;
  question: string;
  question_id: number;
  retrieval_tasks: TaskData[];
  main_feedback?: string;
  annotated_by?: number;
  reasoning: string;
  question_valid: boolean;
};
// export { TaskVars, TaskData, QuestionData };
