/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, AnnotationResponse, TaskGroup } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  addAssignmentUrl,
  annotationsUrl,
  replaceQuestionByIdUrl,
  skipQuestionByIdUrl,
} from '@/apis/api_url';

interface QuestionContextType {
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: number, updates: Partial<Question>) => void;
  submitAnnotation: (response: Question) => Promise<void>;
  skipAnnotation: () => Promise<void>;
  generateNewAssignment: () => Promise<void>;
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

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(annotationsUrl, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const result = await response.json();
      const rawQuestions = result.questions;

      if (!rawQuestions || rawQuestions.length === 0) {
        setQuestions([]); // Clear questions if none found
        setIsLoading(false);
        return;
      }
      const parsedQuestions: Question[] = rawQuestions.map(
        (q: {
          _id: string;
          question_id: number;
          question: string;
          context: string;
          reasoning: string;
          category: string[];
          annotated_by: number;
          question_valid?: boolean;
          reasoning_valid?: boolean;
          main_feedback?: string;
          missing_data?: boolean;
          model: string;
          batch_id: string;
          retrieval_tasks: {
            task_id: number;
            task: string;
            variables: {
              variable: string;
              valid: boolean;
            }[];
          }[];
        }) => ({
          _id: q._id,
          id: q.question_id,
          question: q.question,
          context: q.context,
          reasoning: q.reasoning,
          categories: q.category,
          missingValues: '',
          isValid: q.question_valid ?? undefined,
          isReasoningValid: q.reasoning_valid ?? undefined,
          annotated_by: q.annotated_by,
          feedback: q.main_feedback ?? undefined,
          isCompleted: q.missing_data ?? undefined,
          model: q.model,
          batch_id: q.batch_id,
          tasks: q.retrieval_tasks.map((taskGroup) => ({
            id: String(taskGroup.task_id),
            name: taskGroup.task,
            tasks: taskGroup.variables.map((v, idx) => ({
              id: `${taskGroup.task_id}-${idx}`,
              name: v.variable,
              valid: v.valid,
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

  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user, toast]);

  const updateQuestion = (questionId: number, updates: Partial<Question>) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const submitAnnotation = async (response: Question) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const annotatedQuestion = {
        _id: response._id,
        question_id: response.id, // Optional: if your backend needs it
        question: response.question,
        context: response.context,
        category: response.categories,
        reasoning: response.reasoning,
        question_valid: response.question_valid,
        reasoning_valid: response.reasoning_valid,
        main_feedback: response.feedback || '',
        missing_data: response.missing_data,
        annotated_by: response.annotated_by, // Replace with actual userId if needed
        model: response.model,
        batch_id: response.batch_id,

        retrieval_tasks: response.tasks.map((taskGroup) => ({
          task_id: parseInt(taskGroup.id),
          task: taskGroup.name,
          variables: taskGroup.tasks.map((task) => ({
            variable: task.name,
            valid: task.valid,
          })),
        })),
      };

      const res = await fetch(annotationsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(annotatedQuestion),
      });

      if (!res.ok) throw new Error('Failed to submit annotation');

      updateQuestion(response.id, {
        ...response,
        // annotated_by: 1, // or use actual user id if available
      });

      toast({
        title: 'Annotation Saved',
        description: 'Your annotation has been saved successfully.',
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error save annotation:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Failed to save your annotation. Please try again.',
      });
    }
  };

  const skipAnnotation = async () => {
    if (!user) throw new Error('User not authenticated');
    let res;
    try {
      const userID = user?.userId || -1;
      res = await fetch(skipQuestionByIdUrl + '?user_id=' + userID, {
        method: 'POST',
        body: JSON.stringify({
          question_id: questions[currentQuestionIndex].id,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to replace question');
      }

      await fetchQuestions(); // Refresh questions after skipping

      if (currentQuestionIndex === questions.length - 1) {
        setCurrentQuestionIndex(questions.length - 1 - 1); // Reset to first question if at the end
      }

      toast({
        title: 'Annotation Skipped',
        description: 'Your annotation has been skipped successfully.',
      });
    } catch (error) {
      console.error('Error skipping annotation:', error);

      if (res.status === 409) {
        toast({
          variant: 'destructive',
          title: 'Skip Error',
          description: 'No new questions available to reassign.',
        });
        throw new Error('No new questions available to assign');
      } else {
        toast({
          variant: 'destructive',
          title: 'Skip Error',
          description: 'Failed to skip the annotation. Please try again.',
        });
      }
      return;
    }
  };

  const generateNewAssignment = async () => {
    if (!user) throw new Error('User not authenticated');
    try {
      const userID = user?.userId || -1;
      const res = await fetch(addAssignmentUrl + `?user_id=${userID}`, {
        method: 'POST',
        body: JSON.stringify({
          count: 25,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to assign assignment');
      }

      await fetchQuestions(); // Refresh questions after replacing

      setCurrentQuestionIndex(0); // Reset to first question

      toast({
        title: 'Submission Successful',
        description:
          'Submission successful! You have been assigned a new set of questions.',
      });
    } catch (error) {
      console.error('Error generating new assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: 'Failed to submitted. Please try again.',
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
        skipAnnotation,
        generateNewAssignment,
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
