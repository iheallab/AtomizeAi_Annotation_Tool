import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import {
  List,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  completedQuestions: number;
  totalQuestions: number;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  questions,
  currentIndex,
  completedQuestions,
  totalQuestions,
  onSelectQuestion,
  onSubmit,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipPopover, setSkipPopover] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Fixed floating navigation button */}
      <div className='fixed bottom-6 right-6 z-10'>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size='lg' className='rounded-full h-14 w-14 shadow-lg'>
              <List size={24} />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Question Navigation</DrawerTitle>
            </DrawerHeader>
            <div className='px-4 pb-2'>
              <p className='text-sm text-muted-foreground'>
                {questions.filter((q) => q.annotated_by != -1).length} of{' '}
                {questions.length} questions completed
              </p>
            </div>
            <div className='px-4 max-h-[60vh] overflow-y-auto'>
              <ul className='space-y-2'>
                {questions.map((question, index) => (
                  <li key={question.id}>
                    <Button
                      variant='ghost'
                      className={cn(
                        'w-full justify-start text-left py-3',
                        index === currentIndex && 'bg-secondary',
                        question.annotated_by != -1 &&
                          'text-green-700 dark:text-green-500'
                      )}
                      onClick={() => {
                        onSelectQuestion(index);
                        setOpen(false);
                      }}
                    >
                      <div className='flex items-center w-full'>
                        <span className='mr-2 flex-shrink-0'>
                          {question.annotated_by != -1 ? (
                            <CheckCircle
                              size={16}
                              className='text-green-600 dark:text-green-500'
                            />
                          ) : (
                            <AlertCircle size={16} className='text-amber-500' />
                          )}
                        </span>
                        <div className='flex-grow'>
                          <p className='truncate text-left'>
                            {question.question || `Question ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <DrawerFooter>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Bottom Navigation Controls */}
      <div className='fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-center items-center'>
        <div className='flex justify-end w-[25%]'></div>
        <div className='flex items-center justify-between max-w-md w-[50%]'>
          <Button
            variant='outline'
            disabled={currentIndex === 0}
            onClick={() => onSelectQuestion(currentIndex - 1)}
            className='flex items-center gap-2'
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </Button>

          <div className='text-sm font-medium'>
            Question {currentIndex + 1} of {questions.length}
          </div>

          <Button
            variant='outline'
            disabled={currentIndex === questions.length - 1}
            onClick={() => onSelectQuestion(currentIndex + 1)}
            className='flex items-center gap-2'
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className='flex justify-end w-[25%] pe-10'>
          <Button
            variant='outline'
            onClick={() => setSkipPopover(true)}
            disabled={completedQuestions !== totalQuestions || isSubmitting}
            className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
            <Send size={16} />
          </Button>
        </div>
      </div>
      {skipPopover && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white dark:bg-background rounded-lg shadow-lg p-6 max-w-md w-full'>
            <h3 className='text-lg font-semibold mb-4'>
              Submit All Annotations
            </h3>
            <p className='text-sm text-muted-foreground mb-6'>
              Are you sure you want to submit all annotations? Once submitted,
              you will no longer be able to view these questions, and a new set
              of questions will be generated for you. Please ensure all
              questions are answered to the best of your ability before
              proceeding.
            </p>
            <div className='flex justify-end gap-4'>
              <Button
                variant='outline'
                size='sm'
                className='text-black dark:text-white bg-white border border-border hover:bg-muted dark:hover:bg-muted/20'
                onClick={() => setSkipPopover(false)}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white border border-border'
                onClick={async () => {
                  setSkipPopover(false);
                  await handleSubmit();
                }}
              >
                Confirm Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
