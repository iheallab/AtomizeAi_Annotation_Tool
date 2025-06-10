import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, AnnotationResponse, TaskGroup } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { questionsUrl } from '@/apis/api_url';

interface QuestionContextType {
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  submitAnnotation: (response: Question) => Promise<void>;
  isLoading: boolean;
  totalQuestions: number;
  completedQuestions: number;
}

const QuestionContext = createContext<QuestionContextType | undefined>(
  undefined
);

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(questionsUrl, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const result = await response.json();
        const rawQuestions = result;

        const parsedQuestions: Question[] = rawQuestions.map(
          (q: {
            _id: string;
            question: string;
            context: string;
            reasoning: string;
            category: string[];
            annotated_by: number;
            question_valid?: boolean;
            reasoning_valid?: boolean;
            main_feedback?: string;
            tasks_complete?: boolean;
            retrieval_tasks: {
              task_id: number;
              task: string;
              variables: {
                variable: string;
                valid: boolean;
              }[];
            }[];
          }) => ({
            id: q._id,
            question: q.question,
            context: q.context,
            reasoning: q.reasoning,
            categories: q.category,
            missingValues: '',
            isValid: q.question_valid ?? undefined,
            isReasoningValid: q.reasoning_valid ?? undefined,
            annoated_by: q.annotated_by,
            feedback: q.main_feedback ?? undefined,
            isCompleted: q.tasks_complete ?? false,
            tasks: q.retrieval_tasks.map((taskGroup) => ({
              id: String(taskGroup.task_id),
              name: taskGroup.task,
              tasks: taskGroup.variables.map((v, idx) => ({
                id: `${taskGroup.task_id}-${idx}`,
                name: v.variable,
                enabled: v.valid,
              })),
            })),
          })
        );

        setQuestions(parsedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load questions. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchQuestions();
    }
  }, [user, toast]);

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const submitAnnotation = async (response: Question) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const annotatedQuestion = {
        _id: response.id,
        // question_id: 0, // Optional: if your backend needs it
        question: response.question,
        context: response.context,
        category: response.categories,
        reasoning: response.reasoning,
        question_valid: response.question_valid,
        reasoning_valid: response.reasoning_valid,
        main_feedback: response.feedback || '',
        tasks_complete: true,
        annotated_by: response.annotated_by, // Replace with actual userId if needed

        retrieval_tasks: response.tasks.map((taskGroup) => ({
          task_id: parseInt(taskGroup.id),
          task: taskGroup.name,
          variables: taskGroup.tasks.map((task) => ({
            variable: task.name,
            valid: task.valid,
          })),
        })),
      };

      console.log('submit annotation annotatedQuestion', annotatedQuestion);
      const res = await fetch(questionsUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(annotatedQuestion),
      });

      console.log('res', res);

      if (!res.ok) throw new Error('Failed to submit annotation');

      updateQuestion(response.id, {
        ...response,
        // annotated_by: 1, // or use actual user id if available
      });

      toast({
        title: 'Annotation Submitted',
        description: 'Your annotation has been saved successfully.',
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error submitting annotation:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Failed to submit your annotation. Please try again.',
      });
    }
  };

  const totalQuestions = questions.length;
  const completedQuestions = questions.filter(
    (q) => q.annotated_by !== -1
  ).length;

  return (
    <QuestionContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        updateQuestion,
        submitAnnotation,
        isLoading,
        totalQuestions,
        completedQuestions,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};
