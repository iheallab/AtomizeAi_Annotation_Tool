import React from 'react';
import { useQuestions } from '@/context/QuestionContext';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AnnotationStep } from '@/components/AnnotationStep';
import { QuestionNavigation } from '@/components/QuestionNavigation';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    submitAnnotation,
    isLoading,
    totalQuestions,
    completedQuestions,
  } = useQuestions();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to='/login' />;
  }

  if (isLoading || questions.length === 0) {
    return (
      <div className='min-h-screen flex flex-col bg-background'>
        <Header />
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center p-6 bg-card rounded-lg shadow-soft'>
            <h2 className='text-2xl font-bold mb-4'>Loading questions...</h2>
            <Progress value={33} className='w-64 mx-auto' />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <Header />

      <main className='flex-1 pt-6 pb-24 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Progress indicator */}
          <div className='mb-8 p-4 bg-card rounded-lg shadow-soft'>
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-lg font-medium'>Annotation Progress</h2>
              <span className='text-sm text-muted-foreground'>
                {completedQuestions} of {totalQuestions} questions completed
              </span>
            </div>
            <Progress
              value={(completedQuestions / totalQuestions) * 100}
              className='h-2 bg-secondary'
            />
          </div>

          {/* Current question annotation */}
          <div className='bg-white dark:bg-background border border-border rounded-3xl shadow-2xl px-8 py-10 max-w-5xl mx-auto mt-8 mb-16'>
            <AnnotationStep
              question={currentQuestion}
              onSubmit={submitAnnotation}
            />
          </div>
        </div>
      </main>

      {/* Question navigation */}
      <QuestionNavigation
        questions={questions}
        currentIndex={currentQuestionIndex}
        onSelectQuestion={setCurrentQuestionIndex}
      />
    </div>
  );
};

export default Index;
