
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavigationControlsProps = {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  isSubmitDisabled?: boolean;
};

const NavigationControls = ({
  onPrevious,
  onNext,
  onSubmit,
  isPreviousDisabled = false,
  isNextDisabled = false,
  isSubmitDisabled = false,
}: NavigationControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft size={20} />
          <span className="sr-only">Previous</span>
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          variant="default" 
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="px-8"
        >
          Submit
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={isNextDisabled}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight size={20} />
          <span className="sr-only">Next</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default NavigationControls;
