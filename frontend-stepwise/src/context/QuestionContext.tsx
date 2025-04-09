
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, AnnotationResponse, TaskGroup } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface QuestionContextType {
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  submitAnnotation: (response: AnnotationResponse) => Promise<void>;
  isLoading: boolean;
  totalQuestions: number;
  completedQuestions: number;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// Mock data for testing with hierarchical task structure and different questions
const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'Should we adjust the inotropic support for this patient?',
    context: '65-year-old male with acute myocardial infarction on inotropic support. Patient has been experiencing episodes of hypotension despite current medication regimen.',
    isValid: undefined,
    tasks: [
      {
        id: 'tg1',
        name: 'Vital Signs',
        tasks: [
          { id: 't1', name: 'Blood Pressure', enabled: false },
          { id: 't2', name: 'Heart Rate', enabled: false },
          { id: 't3', name: 'Respiratory Rate', enabled: false },
          { id: 't4', name: 'Temperature', enabled: false },
        ]
      },
      {
        id: 'tg2',
        name: 'Laboratory Values',
        tasks: [
          { id: 't5', name: 'Troponin', enabled: false },
          { id: 't6', name: 'CK-MB', enabled: false },
          { id: 't7', name: 'BNP', enabled: false },
        ]
      },
      {
        id: 'tg3',
        name: 'Medication Records',
        tasks: [
          { id: 't8', name: 'Current Inotropes', enabled: false },
          { id: 't9', name: 'Vasopressors', enabled: false },
        ]
      }
    ],
    reasoning: 'This question is designed to evaluate whether the current inotropic support is appropriate. Vitals, such as blood pressure and heart rate, indicate the current hemodynamic stability, while trends in cardiac enzymes like troponin and CK-MB help assess the extent of myocardial injury. Finally, the medication records provide details about the current inotrope regimen. Together, these tasks allow clinicians to correlate the patient\'s clinical status with laboratory findings and treatment parameters, thereby informing an actionable decision about adjusting inotropic support.',
    isReasoningValid: undefined,
    missingValues: 'Do the tasks retrieve all relevant data that you would search on an EHR system to answer the question?',
    areMissingValuesCorrect: undefined,
    isCompleted: false,
    categories: ['Cardiology', 'Critical Care'],
  },
  {
    id: '2',
    question: 'Is this patient at risk for cardiogenic shock?',
    context: '58-year-old female with unstable angina and decreased cardiac output. Patient reports increasing chest pain and shortness of breath over the past 24 hours.',
    isValid: undefined,
    tasks: [
      {
        id: 'tg1',
        name: 'Vital Signs',
        tasks: [
          { id: 't1', name: 'Blood Pressure', enabled: false },
          { id: 't2', name: 'Heart Rate', enabled: false },
          { id: 't3', name: 'Oxygen Saturation', enabled: false },
          { id: 't4', name: 'Respiratory Rate', enabled: false },
        ]
      },
      {
        id: 'tg2',
        name: 'Cardiac Parameters',
        tasks: [
          { id: 't5', name: 'Cardiac Output', enabled: false },
          { id: 't6', name: 'Ejection Fraction', enabled: false },
          { id: 't7', name: 'Pulmonary Wedge Pressure', enabled: false },
        ]
      },
      {
        id: 'tg3',
        name: 'Laboratory Values',
        tasks: [
          { id: 't8', name: 'Lactate', enabled: false },
          { id: 't9', name: 'Troponin', enabled: false },
          { id: 't10', name: 'BNP', enabled: false },
        ]
      },
      {
        id: 'tg4',
        name: 'Clinical Assessment',
        tasks: [
          { id: 't11', name: 'Urine Output', enabled: false },
          { id: 't12', name: 'Mental Status', enabled: false },
          { id: 't13', name: 'Skin Temperature', enabled: false },
        ]
      }
    ],
    reasoning: 'This question evaluates the risk of cardiogenic shock by examining vital signs and cardiac function parameters. Low blood pressure with elevated heart rate can indicate compensatory mechanisms for reduced cardiac output. Directly measuring cardiac output and ejection fraction provides objective data on cardiac pump function. Lactate levels help assess tissue perfusion, while troponin indicates myocardial damage. Clinical assessments of urine output and mental status reflect end-organ perfusion. These variables together help determine if the patient is progressing toward cardiogenic shock and requires immediate intervention.',
    isReasoningValid: undefined,
    missingValues: 'Would ECG findings and arterial blood gas results be relevant additional data points to assess this risk?',
    areMissingValuesCorrect: undefined,
    isCompleted: false,
    categories: ['Cardiology', 'Emergency Medicine'],
  },
  {
    id: '3',
    question: 'Should we discontinue anticoagulation for this patient?',
    context: '72-year-old patient with atrial fibrillation who has developed mild epistaxis. Patient is currently on warfarin with an INR of 3.2.',
    isValid: undefined,
    tasks: [
      {
        id: 'tg1',
        name: 'Coagulation Parameters',
        tasks: [
          { id: 't1', name: 'INR', enabled: false },
          { id: 't2', name: 'PT', enabled: false },
          { id: 't3', name: 'aPTT', enabled: false },
          { id: 't4', name: 'Platelet Count', enabled: false },
        ]
      },
      {
        id: 'tg2',
        name: 'Blood Tests',
        tasks: [
          { id: 't5', name: 'Hemoglobin', enabled: false },
          { id: 't6', name: 'Hematocrit', enabled: false },
          { id: 't7', name: 'Complete Blood Count', enabled: false },
        ]
      },
      {
        id: 'tg3',
        name: 'Renal Function',
        tasks: [
          { id: 't8', name: 'Creatinine', enabled: false },
          { id: 't9', name: 'BUN', enabled: false },
          { id: 't10', name: 'GFR', enabled: false },
        ]
      },
      {
        id: 'tg4',
        name: 'Risk Assessment',
        tasks: [
          { id: 't11', name: 'CHA₂DS₂-VASc Score', enabled: false },
          { id: 't12', name: 'HAS-BLED Score', enabled: false },
          { id: 't13', name: 'Recent Bleeding History', enabled: false },
        ]
      }
    ],
    reasoning: 'This question addresses the risk-benefit balance of anticoagulation. INR measurements indicate the current level of anticoagulation, while platelet count helps assess for other potential causes of bleeding. Hemoglobin trends can reveal the severity of blood loss, and creatinine values inform about renal function which affects drug clearance. Risk scores like CHA₂DS₂-VASc and HAS-BLED quantify the thrombotic and bleeding risks respectively. Together, these parameters help evaluate whether the bleeding risk outweighs the thrombotic risk for this patient with atrial fibrillation.',
    isReasoningValid: undefined,
    missingValues: 'Should we also consider the patient\'s medication list to check for drug interactions that might increase bleeding risk?',
    areMissingValuesCorrect: undefined,
    isCompleted: false,
    categories: ['Hematology', 'Geriatrics', 'Cardiology'],
  },
];

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // In a real application, fetch questions from API
        // const response = await fetch('/api/questions', {
        //   headers: { Authorization: `Bearer ${user?.token}` }
        // });
        // const data = await response.json();
        // setQuestions(data);

        // Using mock data for now - with deep clone to prevent shared references
        setQuestions(JSON.parse(JSON.stringify(mockQuestions)));
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load questions. Please try again.",
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
    setQuestions(prevQuestions => 
      prevQuestions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    );
  };

  const submitAnnotation = async (response: AnnotationResponse) => {
    try {
      // In a real application, send to API
      // await fetch('/api/annotations', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${user?.token}`
      //   },
      //   body: JSON.stringify(response)
      // });

      // Update local state
      updateQuestion(response.questionId, {
        isValid: response.isValid,
        tasks: response.tasks,
        isReasoningValid: response.isReasoningValid,
        areMissingValuesCorrect: response.areMissingValuesCorrect,
        feedback: response.feedback,
        isCompleted: true
      });

      toast({
        title: "Annotation Submitted",
        description: "Your annotation has been saved successfully.",
      });

      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (error) {
      console.error('Error submitting annotation:', error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to submit your annotation. Please try again.",
      });
    }
  };

  const totalQuestions = questions.length;
  const completedQuestions = questions.filter(q => q.isCompleted).length;

  return (
    <QuestionContext.Provider value={{
      questions,
      currentQuestionIndex,
      setCurrentQuestionIndex,
      updateQuestion,
      submitAnnotation,
      isLoading,
      totalQuestions,
      completedQuestions
    }}>
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
