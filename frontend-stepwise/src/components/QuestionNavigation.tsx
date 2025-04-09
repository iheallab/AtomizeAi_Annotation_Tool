
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import { List, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger, 
  DrawerFooter 
} from '@/components/ui/drawer';

interface QuestionNavigationProps {
  questions: Question[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({ 
  questions, 
  currentIndex,
  onSelectQuestion
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed floating navigation button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
              <List size={24} />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Question Navigation</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <p className="text-sm text-muted-foreground">
                {questions.filter(q => q.isCompleted).length} of {questions.length} questions completed
              </p>
            </div>
            <div className="px-4 max-h-[60vh] overflow-y-auto">
              <ul className="space-y-2">
                {questions.map((question, index) => (
                  <li key={question.id}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start text-left py-3",
                        index === currentIndex && "bg-secondary",
                        question.isCompleted && "text-green-700 dark:text-green-500"
                      )}
                      onClick={() => {
                        onSelectQuestion(index);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center w-full">
                        <span className="mr-2 flex-shrink-0">
                          {question.isCompleted ? (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-500" />
                          ) : (
                            <AlertCircle size={16} className="text-amber-500" />
                          )}
                        </span>
                        <div className="flex-grow">
                          <p className="truncate text-left">
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
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Bottom Navigation Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 flex justify-center items-center">
        <div className="flex items-center justify-between max-w-md w-full">
          <Button 
            variant="outline" 
            disabled={currentIndex === 0}
            onClick={() => onSelectQuestion(currentIndex - 1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </Button>
          
          <div className="text-sm font-medium">
            Question {currentIndex + 1} of {questions.length}
          </div>
          
          <Button 
            variant="outline" 
            disabled={currentIndex === questions.length - 1}
            onClick={() => onSelectQuestion(currentIndex + 1)}
            className="flex items-center gap-2"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </>
  );
};
